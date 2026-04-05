# Financial Management Dashboard

## Overview

A full-stack Financial Management Dashboard with JWT-based authentication, role-based access control, and financial record tracking.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Backend**: Node.js + Express 5 (in `artifacts/api-server/`)
- **Database**: MongoDB (via Mongoose)
- **Frontend**: React + Vite (in `artifacts/finance-dashboard/`)
- **Authentication**: JWT tokens (stored as `fin_token` in localStorage)
- **API codegen**: Orval (from OpenAPI spec)
- **Validation**: Zod (from `@workspace/api-zod`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Required Environment Secrets

- `MONGODB_URI` — MongoDB connection string (e.g., mongodb+srv://user:pass@cluster.mongodb.net/financedb)
- `JWT_SECRET` — Secret key for signing JWT tokens

## Architecture

### Backend (`artifacts/api-server/src/`)
- `models/User.ts` — Mongoose User model with bcrypt password hashing
- `models/Record.ts` — Mongoose Record model for financial transactions
- `middlewares/auth.ts` — JWT authentication middleware + role-based access
- `routes/auth/` — Signup, login, /auth/me endpoints
- `routes/users/` — User CRUD (admin only)
- `routes/records/` — Financial record CRUD with filtering/pagination
- `routes/dashboard/` — Aggregated analytics (summary, categories, monthly, recent)
- `lib/db.ts` — MongoDB connection via Mongoose

### Frontend (`artifacts/finance-dashboard/src/`)
- `lib/auth.tsx` — AuthContext with JWT token management
- `lib/api-client.ts` — Wires `fin_token` into all API calls
- `pages/login.tsx`, `pages/signup.tsx` — Authentication screens
- `pages/dashboard.tsx` — KPIs, charts, recent transactions
- `pages/records.tsx` — Full CRUD for financial records
- `pages/users.tsx` — User management (admin only)
- `pages/profile.tsx` — Profile and logout

## Role Permissions

- **Viewer** — Read-only dashboard access
- **Analyst** — View records + create/edit records + dashboard
- **Admin** — Full access (CRUD users + records + dashboard)

## API Routes

All routes prefixed with `/api`:
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login, returns JWT token
- `GET /api/auth/me` — Get current user (requires auth)
- `GET/POST /api/users` — List/create users (admin only)
- `GET/PATCH/DELETE /api/users/:id` — User CRUD (admin only)
- `GET/POST /api/records` — List/create financial records
- `GET/PATCH/DELETE /api/records/:id` — Record CRUD
- `GET /api/dashboard/summary` — Financial totals
- `GET /api/dashboard/category-totals` — Category breakdown
- `GET /api/dashboard/monthly-summary` — Monthly income/expense
- `GET /api/dashboard/recent-transactions` — Last 5 transactions
