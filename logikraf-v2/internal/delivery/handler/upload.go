package handler

import (
	"crypto/sha256"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/pkg/storage"
)

const maxUploadSize = 10 << 20 // 10MB

var allowedExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
}

// UploadImage handles multipart image upload to S3-compatible storage.
// POST /api/upload?folder=portfolio  (form field "image")
// Returns {url: "https://is3.cloudhost.id/logikraf-storage/logikraf/<folder>/<hash>.<ext>"}
func UploadImage(c fiber.Ctx) error {
	folder := c.Query("folder", "misc")
	if !isValidFolder(folder) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid folder"})
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no image field"})
	}
	if fileHeader.Size > maxUploadSize {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{"error": "file too large (max 10MB)"})
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if !allowedExt[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "unsupported type"})
	}

	src, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot read file"})
	}
	defer src.Close()

	// hash content for dedup + safe filename
	h := sha256.New()
	tee := io.TeeReader(src, h)
	buf, err := io.ReadAll(tee)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "read failed"})
	}
	sum := fmt.Sprintf("%x", h.Sum(nil))[:16]
	objectName := fmt.Sprintf("logikraf/%s/%d_%s%s", folder, time.Now().Unix(), sum, ext)

	s3, err := storage.NewS3Client()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "storage unavailable"})
	}

	bucket := os.Getenv("S3_BUCKET")
	_, err = s3.UploadFile(c.Context(), bucket, objectName, strings.NewReader(string(buf)), int64(len(buf)), fileHeader.Header.Get("Content-Type"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "upload failed"})
	}
	// best-effort: make folder publicly readable
	_ = s3.SetPublicReadPolicy(c.Context(), bucket, "logikraf/"+folder)

	url := fmt.Sprintf("https://%s/%s/%s", os.Getenv("S3_ENDPOINT"), bucket, objectName)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"url": url})
}

func isValidFolder(f string) bool {
	switch f {
	case "portfolio", "post", "misc", "tenant":
		return true
	}
	return false
}

var _ multipart.FileHeader
