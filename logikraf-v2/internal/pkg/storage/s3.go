package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3Client interface {
	UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (string, error)
	GetPresignedURL(ctx context.Context, bucketName, objectName string) (string, error)
	SetPublicReadPolicy(ctx context.Context, bucketName, prefix string) error
}

type minioClient struct {
	client *minio.Client
}

func NewS3Client() (S3Client, error) {
	endpoint := os.Getenv("S3_ENDPOINT")       // e.g., "is3.cloudhost.id"
	accessKeyID := os.Getenv("S3_ACCESS_KEY")
	secretAccessKey := os.Getenv("S3_SECRET_KEY")
	useSSL := true

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})

	if err != nil {
		log.Printf("Failed to initialize S3 Client: %v", err)
		return nil, err
	}

	return &minioClient{client: client}, nil
}

func (m *minioClient) UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (string, error) {
	// Ensure bucket exists
	exists, err := m.client.BucketExists(ctx, bucketName)
	if err != nil {
		return "", err
	}
	if !exists {
		err = m.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return "", err
		}
	}

	_, err = m.client.PutObject(ctx, bucketName, objectName, reader, objectSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}

	return objectName, nil
}

func (m *minioClient) GetPresignedURL(ctx context.Context, bucketName, objectName string) (string, error) {
	// Generate presigned url valid for 1 hour
	url, err := m.client.PresignedGetObject(ctx, bucketName, objectName, time.Hour, nil)
	if err != nil {
		return "", err
	}
	return url.String(), nil
}

// SetPublicReadPolicy makes objects under `prefix` in `bucketName` publicly
// readable (e.g. `sbdigital/avatars/`), while the rest of the bucket stays
// private. Best-effort: callers should not fail on policy errors.
func (m *minioClient) SetPublicReadPolicy(ctx context.Context, bucketName, prefix string) error {
	exists, err := m.client.BucketExists(ctx, bucketName)
	if err != nil {
		return err
	}
	if !exists {
		if err := m.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{}); err != nil {
			return err
		}
	}
	policy := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [{
			"Effect": "Allow",
			"Principal": {"AWS": ["*"]},
			"Action": ["s3:GetObject"],
			"Resource": ["arn:aws:s3:::%s/%s*"]
		}]
	}`, bucketName, prefix)
	return m.client.SetBucketPolicy(ctx, bucketName, policy)
}
