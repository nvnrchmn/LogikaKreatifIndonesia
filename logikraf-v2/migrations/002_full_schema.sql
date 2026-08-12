-- logikraf-v2 full schema
-- Run: mysql -u root -p logikraf_v2 < migrations/002_full_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  must_change_password TINYINT(1) DEFAULT 0,
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(100),
  icon VARCHAR(500),
  base_price INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_services_slug (slug),
  INDEX idx_services_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  description TEXT,
  client_name VARCHAR(255),
  service_id BIGINT UNSIGNED,
  thumbnail VARCHAR(500),
  gallery_images TEXT,
  tech_stack TEXT,
  challenge TEXT,
  solution TEXT,
  result TEXT,
  project_url VARCHAR(500),
  completed_at DATE,
  is_featured TINYINT(1) DEFAULT 0,
  is_published TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_portfolios_slug (slug),
  INDEX idx_portfolios_published (is_published),
  INDEX idx_portfolios_service (service_id),
  CONSTRAINT fk_portfolios_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  price INT NOT NULL,
  strike_price INT,
  features TEXT,
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_packages_slug (slug),
  INDEX idx_packages_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  company VARCHAR(255),
  service_category VARCHAR(100),
  project_description TEXT,
  estimated_pages VARCHAR(100),
  target_launch DATE,
  budget_range VARCHAR(100),
  lead_score INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_leads_status (status),
  INDEX idx_leads_score (lead_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255),
  pic_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  address TEXT,
  city VARCHAR(255),
  notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_clients_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id BIGINT UNSIGNED,
  service_id BIGINT UNSIGNED,
  package_id BIGINT UNSIGNED,
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(255),
  project_name VARCHAR(255) NOT NULL,
  project_brief TEXT,
  total_amount INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  milestone_status VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_orders_number (order_number),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  position INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_order_tasks_order (order_id),
  CONSTRAINT fk_order_tasks_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_order_comments_order (order_id),
  CONSTRAINT fk_order_comments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_files (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_order_files_order (order_id),
  CONSTRAINT fk_order_files_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_files_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS time_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED,
  order_task_id BIGINT UNSIGNED,
  user_id BIGINT UNSIGNED,
  description TEXT,
  minutes INT DEFAULT 0,
  worked_date DATE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_time_entries_order (order_id),
  INDEX idx_time_entries_task (order_task_id),
  INDEX idx_time_entries_user (user_id),
  CONSTRAINT fk_time_entries_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_time_entries_task FOREIGN KEY (order_task_id) REFERENCES order_tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_time_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED,
  transaction_reference VARCHAR(100) UNIQUE,
  milestone_name VARCHAR(255),
  payment_method VARCHAR(100),
  amount INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_url VARCHAR(500),
  raw_gateway_response TEXT,
  settled_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_transactions_order (order_id),
  INDEX idx_transactions_status (status),
  CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  order_id BIGINT UNSIGNED,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  resolved_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_tickets_user (user_id),
  INDEX idx_tickets_status (status),
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_replies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_ticket_replies_ticket (ticket_id),
  CONSTRAINT fk_ticket_replies_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_replies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT,
  featured_image VARCHAR(500),
  is_published TINYINT(1) DEFAULT 0,
  published_at DATETIME,
  author_id BIGINT UNSIGNED,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_posts_slug (slug),
  INDEX idx_posts_published (is_published),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  position VARCHAR(255),
  content TEXT NOT NULL,
  avatar VARCHAR(500),
  is_featured TINYINT(1) DEFAULT 0,
  is_approved TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_testimonials_featured (is_featured),
  INDEX idx_testimonials_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) DEFAULT 'quotation',
  status VARCHAR(50) DEFAULT 'draft',
  client_id BIGINT UNSIGNED,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_company VARCHAR(255),
  subject VARCHAR(255),
  notes TEXT,
  items TEXT,
  subtotal INT DEFAULT 0,
  tax_amount INT DEFAULT 0,
  discount_amount INT DEFAULT 0,
  total INT DEFAULT 0,
  issue_date DATE,
  due_date DATE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_invoices_number (number),
  INDEX idx_invoices_status (status),
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  `value` TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visitor_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(45),
  method VARCHAR(10),
  path VARCHAR(500),
  route_name VARCHAR(255),
  user_agent TEXT,
  referer VARCHAR(500),
  is_bot TINYINT(1) DEFAULT 0,
  visited_at DATETIME NOT NULL,
  INDEX idx_visitor_logs_visited (visited_at),
  INDEX idx_visitor_logs_bot (is_bot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
