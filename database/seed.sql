-- Sales Performance Analytics Web Portal Seed Data (Indian Market Context)
USE sales_analytics_db;

-- 1. Insert Regions (India)
INSERT INTO Regions (region_id, region_name, code, country) VALUES
(1, 'North India (Delhi NCR)', 'IN-NORTH', 'India'),
(2, 'West India (Mumbai & Pune)', 'IN-WEST', 'India'),
(3, 'South India (Bengaluru)', 'IN-SOUTH', 'India'),
(4, 'Central India (Hyderabad)', 'IN-CENTRAL', 'India'),
(5, 'East India (Kolkata)', 'IN-EAST', 'India');

-- 2. Insert Users
INSERT INTO Users (user_id, name, email, password, role, avatar) VALUES
(1, 'Aarav Sharma', 'admin@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(2, 'Priya Patel', 'manager@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(3, 'Rohan Verma', 'salesperson1@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Salesperson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(4, 'Ananya Iyer', 'ananya.iyer@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Salesperson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
(5, 'Vikram Reddy', 'vikram.reddy@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Salesperson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(6, 'Neha Banerjee', 'neha.banerjee@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Salesperson', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(7, 'Aditya Kulkarni', 'aditya.kulkarni@analytics.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Salesperson', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150');

-- 3. Insert Salespersons
INSERT INTO Salespersons (salesperson_id, user_id, name, email, phone, region_id, target_amount, hire_date) VALUES
(1, 3, 'Rohan Verma', 'salesperson1@analytics.com', '+91 98765 43210', 1, 1500000.00, '2023-01-15'),
(2, 4, 'Ananya Iyer', 'ananya.iyer@analytics.com', '+91 98123 45678', 3, 1800000.00, '2023-03-20'),
(3, 5, 'Vikram Reddy', 'vikram.reddy@analytics.com', '+91 97654 32109', 4, 2000000.00, '2022-11-10'),
(4, 6, 'Neha Banerjee', 'neha.banerjee@analytics.com', '+91 96543 21098', 5, 1600000.00, '2023-06-01'),
(5, 7, 'Aditya Kulkarni', 'aditya.kulkarni@analytics.com', '+91 95432 10987', 2, 1200000.00, '2023-09-12');

-- 4. Insert Customers (Indian Enterprise Accounts)
INSERT INTO Customers (customer_id, name, email, phone, company, location, region_id) VALUES
(1, 'Tata Consultancy Services', 'billing@tcs.co.in', '+91 22 6778 9999', 'TCS Ltd', 'Mumbai, India', 2),
(2, 'Infosys Digital', 'procurement@infosys.com', '+91 80 2852 0261', 'Infosys Ltd', 'Bengaluru, India', 3),
(3, 'Bharti Airtel Enterprises', 'info@airtel.in', '+91 11 4666 6100', 'Bharti Airtel', 'New Delhi, India', 1),
(4, 'Wipro Technologies', 'contact@wipro.com', '+91 80 2844 0011', 'Wipro Ltd', 'Bengaluru, India', 3),
(5, 'Reliance Digital Solutions', 'vendas@reliance.in', '+91 22 3555 5000', 'Reliance Industries', 'Mumbai, India', 2),
(6, 'HCL Technologies', 'orders@hcltech.com', '+91 120 252 6171', 'HCL Tech', 'Noida, India', 1),
(7, 'Tech Mahindra', 'finance@techmahindra.com', '+91 40 3063 6363', 'Tech Mahindra', 'Hyderabad, India', 4),
(8, 'ITC Infotech', 'purchasing@itcinfotech.com', '+91 33 2288 9371', 'ITC Infotech', 'Kolkata, India', 5);

-- 5. Insert Products (INR Pricing)
INSERT INTO Products (product_id, product_name, sku, category, price, cost, stock_quantity) VALUES
(1, 'Enterprise Analytics Suite', 'PRD-SW-001', 'Software', 250000.00, 70000.00, 999),
(2, 'Cloud Data Lake Platform', 'PRD-SW-002', 'Cloud Services', 480000.00, 140000.00, 999),
(3, 'AI Predictive Analytics Module', 'PRD-AI-001', 'AI & ML', 370000.00, 100000.00, 999),
(4, 'Executive BI License', 'PRD-SW-003', 'Software', 90000.00, 20000.00, 999),
(5, 'Cybersecurity Audit Suite', 'PRD-SEC-001', 'Security', 300000.00, 90000.00, 999),
(6, 'IoT Edge Gateway Hardware', 'PRD-HW-001', 'Hardware', 160000.00, 95000.00, 150),
(7, '24/7 Premium Managed Support', 'PRD-SRV-001', 'Services', 120000.00, 40000.00, 999),
(8, 'Data Migration Consulting', 'PRD-SRV-002', 'Services', 190000.00, 75000.00, 999);

-- 6. Insert Sales Transactions (INR Values)
INSERT INTO Sales (sale_id, salesperson_id, customer_id, product_id, region_id, quantity, amount, profit, sale_date, status, payment_method) VALUES
(1, 1, 3, 1, 1, 2, 500000.00, 360000.00, '2025-10-12', 'Completed', 'Bank Transfer'),
(2, 1, 6, 4, 1, 4, 360000.00, 280000.00, '2025-11-05', 'Completed', 'UPI / NetBanking'),
(3, 5, 1, 2, 2, 1, 480000.00, 340000.00, '2025-11-20', 'Completed', 'Bank Transfer'),
(4, 5, 5, 3, 2, 2, 740000.00, 540000.00, '2025-12-01', 'Completed', 'NetBanking'),
(5, 2, 2, 2, 3, 3, 1440000.00, 1020000.00, '2025-12-15', 'Completed', 'Bank Transfer'),
(6, 4, 8, 5, 5, 2, 600000.00, 420000.00, '2026-01-10', 'Completed', 'Bank Transfer'),
(7, 4, 8, 1, 5, 1, 250000.00, 180000.00, '2026-01-22', 'Completed', 'UPI'),
(8, 3, 7, 6, 4, 3, 480000.00, 195000.00, '2026-02-02', 'Completed', 'NEFT'),
(9, 1, 3, 3, 1, 1, 370000.00, 270000.00, '2026-02-14', 'Completed', 'Bank Transfer'),
(10, 5, 1, 5, 2, 1, 300000.00, 210000.00, '2026-02-28', 'Completed', 'NetBanking'),
(11, 2, 4, 1, 3, 2, 500000.00, 360000.00, '2026-03-05', 'Completed', 'Bank Transfer'),
(12, 1, 6, 7, 1, 5, 600000.00, 400000.00, '2026-03-12', 'Completed', 'UPI'),
(13, 5, 5, 8, 2, 2, 380000.00, 230000.00, '2026-03-20', 'Completed', 'Bank Transfer'),
(14, 4, 8, 2, 5, 1, 480000.00, 340000.00, '2026-04-01', 'Completed', 'Bank Transfer'),
(15, 3, 7, 4, 4, 3, 270000.00, 210000.00, '2026-04-15', 'Completed', 'NetBanking'),
(16, 2, 2, 3, 3, 2, 740000.00, 540000.00, '2026-05-10', 'Completed', 'Bank Transfer'),
(17, 1, 3, 2, 1, 2, 960000.00, 680000.00, '2026-06-02', 'Completed', 'Bank Transfer'),
(18, 5, 1, 1, 2, 3, 750000.00, 540000.00, '2026-06-18', 'Completed', 'NetBanking'),
(19, 4, 8, 5, 5, 2, 600000.00, 420000.00, '2026-07-04', 'Completed', 'Bank Transfer'),
(20, 3, 7, 7, 4, 4, 480000.00, 320000.00, '2026-07-21', 'Completed', 'UPI'),
(21, 2, 4, 6, 3, 4, 640000.00, 260000.00, '2026-08-05', 'Completed', 'NEFT'),
(22, 1, 6, 3, 1, 1, 370000.00, 270000.00, '2026-08-19', 'Completed', 'NetBanking'),
(23, 5, 5, 2, 2, 2, 960000.00, 680000.00, '2026-08-28', 'Completed', 'Bank Transfer'),
(24, 2, 2, 5, 3, 1, 300000.00, 210000.00, '2026-09-01', 'Completed', 'Bank Transfer');

-- 7. Insert Targets
INSERT INTO Targets (target_id, salesperson_id, region_id, target_amount, achieved_amount, period, year, month, start_date, end_date) VALUES
(1, 1, 1, 1200000.00, 1330000.00, 'Monthly', 2026, 8, '2026-08-01', '2026-08-31'),
(2, 5, 2, 1500000.00, 960000.00, 'Monthly', 2026, 8, '2026-08-01', '2026-08-31'),
(3, 2, 3, 1600000.00, 940000.00, 'Monthly', 2026, 8, '2026-08-01', '2026-08-31'),
(4, 4, 5, 1300000.00, 600000.00, 'Monthly', 2026, 8, '2026-08-01', '2026-08-31'),
(5, 3, 4, 1000000.00, 480000.00, 'Monthly', 2026, 8, '2026-08-01', '2026-08-31'),
(6, 1, 1, 1400000.00, 0.00, 'Monthly', 2026, 9, '2026-09-01', '2026-09-30'),
(7, 2, 3, 1700000.00, 300000.00, 'Monthly', 2026, 9, '2026-09-01', '2026-09-30');

-- 8. Insert Commissions
INSERT INTO Commissions (commission_id, sale_id, salesperson_id, rate_percentage, commission_amount, status, payout_date) VALUES
(1, 1, 1, 5.00, 25000.00, 'Paid', '2025-11-01'),
(2, 3, 5, 5.00, 24000.00, 'Paid', '2025-12-01'),
(3, 5, 2, 6.00, 86400.00, 'Paid', '2026-01-01'),
(4, 17, 1, 5.00, 48000.00, 'Approved', '2026-07-01'),
(5, 23, 5, 5.50, 52800.00, 'Pending', NULL);

-- 9. Insert Notifications
INSERT INTO Notifications (notification_id, user_id, title, message, type, is_read) VALUES
(1, 1, 'Q3 Target Review', 'Q3 regional target benchmarks published for Indian zones.', 'info', true),
(2, 2, 'Monthly Quota Achieved', 'Rohan Verma exceeded August target in North India by 10.8%.', 'success', false),
(3, 3, 'New Enterprise Order', 'Sale #22 worth ₹3,70,000 completed for HCL Tech.', 'success', false);

-- 10. Insert Audit Logs
INSERT INTO AuditLogs (log_id, user_id, action, entity, details, ip_address) VALUES
(1, 1, 'USER_LOGIN', 'Auth', 'User Aarav Sharma logged into Admin portal', '192.168.1.10'),
(2, 2, 'TARGET_UPDATE', 'Targets', 'Updated Q3 Target for Rohan Verma to ₹12,00,000', '192.168.1.15'),
(3, 3, 'SALE_CREATE', 'Sales', 'Created new Sale #24 for Infosys Ltd worth ₹3,00,000', '192.168.1.22');
