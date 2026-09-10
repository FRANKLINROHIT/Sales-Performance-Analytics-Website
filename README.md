# Sales Performance Analytics Web Portal 🚀

A production-grade, full-stack **Sales Performance Analytics Web Portal** designed for MCA / internship evaluation. The portal provides executive-level financial intelligence, sales force leaderboard tracking, product inventory analytics, customer RFM segmentation, scenario simulation, and role-based data governance.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full access to User Management, Audit Trail, Quota Settings, CRUD operations.
   - **Manager**: Access to Team Performance, Regional Reports, Target Adjustments, Scenario Simulation.
   - **Salesperson**: Access scoped to individual deal history, personal targets, and commission logs.

2. **Executive Summary Dashboard**:
   - Total Sales Revenue ($), Orders, Gross Profit, Target Achievement %, Avg Deal Value, Growth Rate %.
   - Interactive Recharts Revenue & Profit trend area graphs, Category pie charts, Regional bar graphs, and top performer cards.

3. **Advanced Analytics & AI Models**:
   - **Sales & Revenue Forecasting**: 3-Month projected linear regression curve.
   - **What-If Scenario Simulator**: Interactive sliders for Quota growth, Price shifts, and Commission rates.
   - **Customer RFM Segmentation**: Cluster analysis (Champions, Loyalists, New Promising, At-Risk).
   - **AI Performer Matrix**: Scores salespersons on volume, growth, and target consistency.

4. **Multi-Format Reporting & Export**:
   - Export filtered sales data to formatted CSV files.
   - Live Preview Table for Sales, Employees, Products, and Customers reports.

5. **Audit Logs & Security**:
   - Automated mutation audit logger capturing user actions, timestamps, and IP addresses.

---

## 📁 System Architecture

```text
sales-performance-analytics/
│
├── frontend/                     # React 18 + Vite Web App
│   ├── src/
│   │   ├── components/           # Sidebar, Topbar, KpiCard, SaleModal, TargetModal, Toast
│   │   ├── context/              # AuthContext, ThemeContext, NotificationContext
│   │   ├── layouts/              # MainLayout container
│   │   ├── pages/                # Dashboard, Sales, Employees, Products, Customers, Targets, Advanced, Reports, Admin, Audit
│   │   ├── services/             # API client
│   │   ├── styles/               # Glassmorphic dark/light CSS design tokens
│   │   └── utils/                # Currency formatters & CSV export utilities
│   └── package.json
│
├── backend/                      # Node.js + Express REST API
│   ├── config/                   # Unified Database Driver (MySQL + SQLite fallback)
│   ├── controllers/              # REST Controller handlers
│   ├── db/                       # Auto-initialization & database seeder
│   ├── middleware/               # JWT Auth, RBAC Role Check, Audit Logger, Error Handler
│   ├── routes/                   # API Express Routers
│   └── server.js                 # Express server bootup
│
├── database/                     # SQL Schemas & Datasets
│   ├── schema.sql                # Production MySQL Schema
│   └── seed.sql                  # Multi-year realistic seed dataset
│
└── README.md                     # Documentation
```

---

## 🛠️ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Start Backend REST API Server
```bash
cd backend
npm install
npm start
```
*Note: The backend runs an automatic embedded database engine out-of-the-box on `http://localhost:5000` pre-seeded with sample data. No local MySQL setup is required for quick evaluation.*

### 2. Start React Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Access the portal at `http://localhost:3000`.*

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@analytics.com` | `admin123` | Full System & Governance |
| **Manager** | `manager@analytics.com` | `manager123` | Regional & Team Analytics |
| **Salesperson** | `salesperson1@analytics.com` | `sales123` | Scoped Personal Deals & Quota |

---

## 🗄️ Core Database Schema

- **Users**: User credentials, roles (`Admin`, `Manager`, `Salesperson`), avatar.
- **Regions**: Geographic sales regions (`NA-EAST`, `NA-WEST`, `EU-CENTRAL`, `APAC`, `LATAM`).
- **Salespersons**: Sales staff profiles, hire dates, target assignments.
- **Customers**: Accounts, companies, locations, RFM scores.
- **Products**: Product catalog, SKUs, category, price, cost, inventory levels.
- **Sales**: Sales transactions (quantity, amount, profit, sale_date, status, payment_method).
- **Targets**: Monthly/Quarterly quotas and real-time achievement tracking.
- **Commissions**: Sales commission logs and payout statuses.
- **Notifications**: System alerts for target achievements and inventory warnings.
- **AuditLogs**: Action audit records with user IDs and IP addresses.
