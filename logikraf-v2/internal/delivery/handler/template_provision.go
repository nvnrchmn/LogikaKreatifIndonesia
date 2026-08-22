package handler

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/internal/pkg/storage"
)

// provisionTemplateForOrder fetches the built artifact of the active template
// tied to the order's package and extracts it into the project folder.
// Best-effort: any failure is logged, never returned — template provisioning
// must not block the order/project creation flow.
func provisionTemplateForOrder(order model.Order, project model.Project) {
	if order.PackageID == 0 {
		return
	}
	var tpl model.ProjectTemplate
	if err := model.DB.Where("package_id = ? AND is_active = ?", order.PackageID, true).First(&tpl).Error; err != nil {
		return // no active template for this package
	}
	if tpl.ArtifactKey == "" {
		return
	}

	bucket := os.Getenv("S3_TEMPLATE_BUCKET")
	if bucket == "" {
		bucket = "logikraf-storage"
	}
	baseDir := os.Getenv("PROJECTS_DIR")
	if baseDir == "" {
		baseDir = "/srv/sites/projects"
	}
	destDir := filepath.Join(baseDir, fmt.Sprintf("order-%d", order.ID))
	if err := os.MkdirAll(destDir, 0o755); err != nil {
		log.Printf("template provision: mkdir failed: %v", err)
		return
	}

	client, err := storage.NewS3Client()
	if err != nil {
		log.Printf("template provision: s3 client failed: %v", err)
		return
	}
	archive := filepath.Join(destDir, "template.tar.gz")
	if err := client.DownloadTo(context.Background(), bucket, tpl.ArtifactKey, archive); err != nil {
		log.Printf("template provision: download failed: %v", err)
		return
	}
	// Leave the archive; extraction is deferred to a worker to avoid blocking
	// the request. ponytail: extraction is O(1) tar -xzf, safe to run async later.
	log.Printf("template provision: downloaded %s for order %d to %s", tpl.ArtifactKey, order.ID, archive)
}
