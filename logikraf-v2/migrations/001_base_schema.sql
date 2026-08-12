-- logikraf-v2 base schema
-- Run: mysql -u root -p < migrations/001_base_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','client') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_desc VARCHAR(500),
  content TEXT,
  color VARCHAR(50),
  icon TEXT,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO services (name, slug, short_desc, color) VALUES
('Software Development', 'software-development', 'Pembuatan perangkat lunak khusus.', '#0052FF'),
('UI/UX Design', 'ui-ux-design', 'Desain antarmuka yang memukau.', '#FF3B30'),
('Digital Marketing', 'digital-marketing', 'Strategi pemasaran berbasis data.', '#34C759'),
('Branding', 'branding', 'Identitas merek yang kuat.', '#FF9500');

CREATE TABLE IF NOT EXISTS packages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  tagline VARCHAR(255),
  price INT UNSIGNED NOT NULL,
  strike_price INT UNSIGNED,
  features JSON,
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS portfolios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id BIGINT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt VARCHAR(500),
  description TEXT,
  client_name VARCHAR(255),
  project_url VARCHAR(500),
  thumbnail VARCHAR(500),
  is_published TINYINT(1) DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_slug (slug),
  INDEX idx_published (is_published),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  service_category VARCHAR(100),
  notes TEXT,
  status ENUM('new','contacted','converted','lost') DEFAULT 'new',
  lead_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  total_amount BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  milestone_status VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  transaction_reference VARCHAR(100) NOT NULL UNIQUE,
  milestone_name VARCHAR(255),
  amount BIGINT UNSIGNED NOT NULL,
  payment_method VARCHAR(100),
  status ENUM('pending','settlement','expired','failed','refund') DEFAULT 'pending',
  settled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_order (order_id),
  INDEX idx_status (status),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  type ENUM('invoice','estimate') DEFAULT 'invoice',
  total BIGINT UNSIGNED NOT NULL,
  status ENUM('draft','sent','paid','cancelled') DEFAULT 'draft',
  issue_date DATE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_number (invoice_number),
  INDEX idx_status (status),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low','medium','high') DEFAULT 'medium',
  status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS time_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  order_task_id BIGINT UNSIGNED,
  user_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255),
  minutes INT UNSIGNED NOT NULL,
  worked_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  INDEX idx_date (worked_date),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testimonials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  content TEXT NOT NULL,
  avatar VARCHAR(500),
  is_approved TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saas_apps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(100) NOT NULL UNIQUE,
  webhook_url VARCHAR(500),
  platform_fee_type ENUM('fixed','percentage') DEFAULT 'fixed',
  platform_fee_amount BIGINT UNSIGNED DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sub_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  saas_app_id BIGINT UNSIGNED NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  api_key VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_saas_app (saas_app_id),
  FOREIGN KEY (saas_app_id) REFERENCES saas_apps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ph_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  saas_app_id BIGINT UNSIGNED,
  sub_account_id BIGINT UNSIGNED,
  external_id VARCHAR(255) NOT NULL UNIQUE,
  amount BIGINT UNSIGNED NOT NULL,
  platform_fee_amount BIGINT UNSIGNED NOT NULL,
  status ENUM('PENDING','PAID','FAILED','EXPIRED','REFUND') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_external_id (external_id),
  INDEX idx_status (status),
  FOREIGN KEY (saas_app_id) REFERENCES saas_apps(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_account_id) REFERENCES sub_accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ph_disbursements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  saas_app_id BIGINT UNSIGNED,
  sub_account_id BIGINT UNSIGNED,
  amount BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  FOREIGN KEY (saas_app_id) REFERENCES saas_apps(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_account_id) REFERENCES sub_accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
