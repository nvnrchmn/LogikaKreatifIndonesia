-- 005_cms.sql
-- CMS tables for Logikraf Business Website Platform (Phase 1)

CREATE TABLE IF NOT EXISTS pages (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id  BIGINT       NOT NULL,
  slug       VARCHAR(64)  NOT NULL,
  title      VARCHAR(160),
  meta_json  JSON,
  published  TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_page (tenant_id, slug),
  INDEX idx_page_tenant (tenant_id)
);

CREATE TABLE IF NOT EXISTS sections (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  page_id     BIGINT       NOT NULL,
  type        VARCHAR(64)  NOT NULL,
  content_json JSON,
  sort_order  INT          NOT NULL DEFAULT 0,
  INDEX idx_section_page (page_id)
);

CREATE TABLE IF NOT EXISTS media (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id  BIGINT       NOT NULL,
  url        VARCHAR(512) NOT NULL,
  alt        VARCHAR(160),
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_tenant (tenant_id)
);
