# Deploying to Vercel Guide

This project is configured to deploy both the **Frontend (React + Vite)** and **Backend (Express API Serverless)** onto **Vercel** as a unified full-stack application.

---

## 🚀 Option 1: Deploy via GitHub (Recommended)

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"** -> **"Import"** your repository.
3. Keep the **Root Directory** as `./` (do not change to frontend or backend). Vercel reads the root `vercel.json`.
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `super_secret_sales_analytics_key_2026_mca_project` (or your custom secret)
   - `DB_TYPE`: `sqlite`
5. Click **"Deploy"**.

---

## ⚡ Option 2: Deploy via Vercel CLI

Run the following command in the project root folder:
```bash
npx vercel
```
- When asked `Set up and deploy?`, press **Y**.
- Select your Vercel account/scope.
- `Link to existing project?` -> **N**.
- `What's your project's name?` -> Press Enter or type a custom name.
- `In which directory is your code located?` -> Press Enter (`./`).
- When asked if you want to modify settings, press **N**.

For production deployment:
```bash
npx vercel --prod
```

---

## 🔑 Demo Login Credentials

Once deployed, you can log in with any of these pre-seeded accounts:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@analytics.com` | `admin123` | Full System Governance & Audit Trail |
| **Manager** | `manager@analytics.com` | `manager123` | Regional & Team Analytics, Simulations |
| **Salesperson** | `salesperson1@analytics.com` | `sales123` | Individual Deals, Quota & Commission Logs |

---

## ⚙️ How the Vercel Architecture Works
- **Routing**: Root `vercel.json` routes `/api/*` to the serverless function `backend/api/index.js` and all other web paths to the Vite React SPA (`frontend/dist/index.html`).
- **Database**: Runs SQLite in `:memory:` mode in serverless environments, automatically populated with the Indian market sales dataset on startup.
