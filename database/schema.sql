-- Sales Performance Analytics Web Portal Database Schema (MySQL Compatible)
CREATE DATABASE IF NOT EXISTS sales_analytics_db;
USE sales_analytics_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Salesperson') NOT NULL DEFAULT 'Salesperson',
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Regions Table
CREATE TABLE IF NOT EXISTS Regions (
    region_id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    country VARCHAR(100) DEFAULT 'India'
);

-- 3. Salespersons Table
CREATE TABLE IF NOT EXISTS Salespersons (
    salesperson_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    region_id INT,
    target_amount DECIMAL(12,2) DEFAULT 0.00,
    hire_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES Regions(region_id) ON DELETE SET NULL
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30),
    company VARCHAR(150),
    location VARCHAR(100),
    region_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES Regions(region_id) ON DELETE SET NULL
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sales Table
CREATE TABLE IF NOT EXISTS Sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    salesperson_id INT NOT NULL,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    region_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    amount DECIMAL(12,2) NOT NULL,
    profit DECIMAL(12,2) NOT NULL,
    sale_date DATE NOT NULL,
    status ENUM('Completed', 'Pending', 'Cancelled') DEFAULT 'Completed',
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    FOREIGN KEY (salesperson_id) REFERENCES Salespersons(salesperson_id),
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (region_id) REFERENCES Regions(region_id)
);

-- 7. Targets Table
CREATE TABLE IF NOT EXISTS Targets (
    target_id INT AUTO_INCREMENT PRIMARY KEY,
    salesperson_id INT NULL,
    region_id INT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    achieved_amount DECIMAL(12,2) DEFAULT 0.00,
    period ENUM('Monthly', 'Quarterly', 'Yearly') DEFAULT 'Monthly',
    year INT NOT NULL,
    month INT DEFAULT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (salesperson_id) REFERENCES Salespersons(salesperson_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES Regions(region_id) ON DELETE CASCADE
);

-- 8. Commissions Table
CREATE TABLE IF NOT EXISTS Commissions (
    commission_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    salesperson_id INT NOT NULL,
    rate_percentage DECIMAL(5,2) DEFAULT 5.00,
    commission_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Paid', 'Approved') DEFAULT 'Pending',
    payout_date DATE DEFAULT NULL,
    FOREIGN KEY (sale_id) REFERENCES Sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (salesperson_id) REFERENCES Salespersons(salesperson_id)
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 10. AuditLogs Table
CREATE TABLE IF NOT EXISTS AuditLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Indexes for optimal analytics querying
CREATE INDEX idx_sales_date ON Sales(sale_date);
CREATE INDEX idx_sales_region ON Sales(region_id);
CREATE INDEX idx_sales_salesperson ON Sales(salesperson_id);
CREATE INDEX idx_sales_product ON Sales(product_id);
CREATE INDEX idx_targets_period ON Targets(year, month);
