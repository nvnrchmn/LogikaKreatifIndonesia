-- 004_tenant_system.sql
-- Multi-tenant foundation for Logikraf Business Website Platform (Phase 1)

CREATE TABLE IF NOT EXISTS plans (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(32)  NOT NULL UNIQUE,
  name        VARCHAR(80)  NOT NULL,
  price_month INT          NOT NULL DEFAULT 0,
  setup_fee   INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  slug          VARCHAR(64)  NOT NULL UNIQUE,
  business_name VARCHAR(160) NOT NULL,
  description   TEXT,
  logo_url      VARCHAR(512),
  favicon_url   VARCHAR(512),
  contact_email VARCHAR(160),
  contact_phone VARCHAR(40),
  address       VARCHAR(255),
  maps_embed    TEXT,
  whatsapp     VARCHAR(40),
  domain        VARCHAR(255) DEFAULT NULL,
  plan_id       BIGINT       NOT NULL,
  theme_json    JSON,
  seo_json      JSON,
  social_json   JSON,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_slug (slug)
);

CREATE TABLE IF NOT EXISTS entitlements (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id   BIGINT       NOT NULL,
  feature   VARCHAR(64)  NOT NULL,
  enabled   TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX idx_ent_plan (plan_id)
);

-- Seed plans
INSERT INTO plans (code, name, price_month, setup_fee) VALUES
  ('starter',   'Starter',   0,    0),
  ('business',  'Business',  99000, 0),
  ('commerce',  'Commerce', 199000, 0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed Starter entitlements (Phase 1 baseline)
SET @starter_id = (SELECT id FROM plans WHERE code = 'starter');
INSERT INTO entitlements (plan_id, feature, enabled) VALUES
  (@starter_id, 'cms',        1),
  (@starter_id, 'pages',      1),
  (@starter_id, 'gallery',    1),
  (@starter_id, 'contact',    1),
  (@starter_id, 'maps',       1),
  (@starter_id, 'whatsapp',   1),
  (@starter_id, 'seo_basic',  1),
  (@starter_id, 'booking',    0),
  (@starter_id, 'order',      0),
  (@starter_id, 'payment',    0),
  (@starter_id, 'inventory',  0)
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled);

-- Extend users with tenant scoping (if not present)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'tenant_id');
SET @sql = IF(@col = 0,
  'ALTER TABLE users ADD COLUMN tenant_id BIGINT DEFAULT NULL, ADD COLUMN role VARCHAR(32) DEFAULT "owner"',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
