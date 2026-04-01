# Finance dashboard — backend & client (MERN)

This project is a small **finance dashboard** system: users sign in, see income/expense summaries, and (depending on their role) view or manage transactions and users.

**Stack:** MongoDB · Express · React (Vite) · Node.js — the usual **MERN** setup.

---

## What’s included

- **Users and roles** — `viewer`, `analyst`, and `admin`, with different permissions.
- **Financial records** — income/expense entries with amount, category, date, and notes.
- **Dashboard data** — totals, category breakdown, recent activity, and simple trends.
- **Security** — JWT login, role checks on the server (not only in the browser).
- **Web UI** — login, dashboard, records list, and (for admins) user management and record create/edit/delete.

---

## Before you start (checklist)

You need:

1. **Node.js** installed (LTS is fine).
2. A **MongoDB Atlas** account and a cluster (free tier works).
3. A **connection string** for your database (see below).

---

## 1. Get your MongoDB connection string

1. Open [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a cluster if you don’t have one.
2. **Database Access** → create a database user (username + password). Remember the password.
3. **Network Access** → add your IP, or `0.0.0.0/0` for development (only if you accept the security tradeoff).
4. **Database** → **Connect** → **Drivers** → copy the URI.
5. Put your **password** into the URI where it says `<password>`.
6. Add a **database name** in the path, for example:  
   `...mongodb.net/finance_dashboard?retryWrites=true&w=majority`  
   (the part before `?` is your database name).

---

## 2. Configure environment variables

1. Copy `server/.env.example` to `server/.env`.
2. Fill in at least:

| Variable | What it is |
|----------|------------|
| `MONGODB_URI` | Your full Atlas URI (with password and database name). |
| `JWT_SECRET` | Any long random string, **at least 16 characters** (used to sign login tokens). |

Optional:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000`). |
| `CLIENT_ORIGIN` | Your React app URL (default `http://localhost:5173`). |
| `ALLOW_PUBLIC_REGISTER` | Set to `true` only if you want extra public sign-ups after the first user exists (dev only). |

---

## 3. Install dependencies

From the **project root** folder:

```bash
npm install
npm run install:all
```

That installs the root helper scripts, the `server` package, and the `client` package.

---

## 4. Load sample data (recommended)

This creates a default **admin** and a few sample transactions so the dashboard and lists are not empty.

```bash
npm run seed
```

Default admin login (you can change these with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `server/.env` before seeding):

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `AdminPass123!` |

---

## 5. Run the app

```bash
npm run dev
```

- **Website (React):** [http://localhost:5173](http://localhost:5173)
- **API:** [http://localhost:5000](http://localhost:5000)
- **Health check:** [http://localhost:5000/health](http://localhost:5000/health) — should return JSON with `"ok": true`.

---

## How to test the assignment (step by step)

Follow this order once; it matches what you’ll want to show or explain.

### A. Smoke test (everyone)

1. Open `http://localhost:5000/health` — you should see a small JSON response.
2. Open `http://localhost:5173` and log in with the **seed admin** (see table above).
3. Open **Dashboard** — you should see totals and recent activity.
4. Open **Records** — you should see a table and **Create / Edit / Delete** (admin only).
5. Open **Admin: Users** — you should see user list and create form (admin only).

---

### B. Test **admin**

1. **Records** — create a new entry (amount, type, category, date, notes). Save.
2. Edit one row, then try delete (soft delete).
3. **Admin: Users** — create a new user with role **viewer** and another with role **analyst** (use different emails and passwords you remember).

---

### C. Test **viewer**

1. Log out, then log in as the **viewer** account you created.
2. **Dashboard** — should work.
3. **Records** — should show an error (viewers cannot list raw transaction rows).

---

### D. Test **analyst**

1. Log out, then log in as the **analyst** account.
2. **Dashboard** — should work.
3. **Records** — should show the table (read-only in the UI; no admin create/delete unless you add that for analysts).

---

### E. Quick API checks (optional)

Use Postman, Thunder Client, or `curl`:

1. **Login:** `POST http://localhost:5000/api/auth/login` with JSON body `{ "email": "...", "password": "..." }`. Copy the `token` from the response.
2. **Authorized request:** `GET http://localhost:5000/api/dashboard/summary` with header `Authorization: Bearer <paste token>`.

If the token is missing or wrong, you get **401**. If your role is not allowed for that route, you get **403**.

---

## Who can do what

| Role | Dashboard | See transaction list | Add / edit / delete transactions | Manage users |
|------|-----------|----------------------|----------------------------------|--------------|
| Viewer | Yes | No | No | No |
| Analyst | Yes | Yes | No | No |
| Admin | Yes | Yes | Yes | Yes |

Rules are enforced in the **API** (`server`), so the browser cannot bypass them.

---

## Sign-up rules

- If the database has **no users**, the first registration via `POST /api/auth/register` creates a **viewer** only.
- After that, new accounts are normally created by an **admin** (`POST /api/users`) unless you set `ALLOW_PUBLIC_REGISTER=true` for local experiments.

---

## API overview (summary)

Base URL: `http://localhost:5000` (or your deployed host).

- **Headers:** `Content-Type: application/json` for bodies with JSON.  
- **Auth:** `Authorization: Bearer <token>` after login.

### Auth

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | First user or when `ALLOW_PUBLIC_REGISTER=true`. |
| POST | `/api/auth/login` | Returns `token` and `user`. |
| GET | `/api/auth/me` | Current user (needs token). |

### Users (admin only)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/users` | List users. |
| GET | `/api/users/:id` | One user. |
| POST | `/api/users` | Create user (`email`, `password`, `name`, optional `role`, `status`). |
| PATCH | `/api/users/:id` | Update fields. |
| DELETE | `/api/users/:id` | Delete (cannot delete yourself). |

### Financial records

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/records` | Analyst and admin. Query: `page`, `limit`, `type`, `category`, `dateFrom`, `dateTo`, `search`. |
| GET | `/api/records/:id` | One record. |
| POST | `/api/records` | Admin. Body: `amount`, `type` (`income` or `expense`), `category`, `date` (ISO string), optional `notes`. |
| PATCH | `/api/records/:id` | Admin. |
| DELETE | `/api/records/:id` | Admin. Soft delete (`deletedAt`). |

### Dashboard

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/dashboard/summary` | Totals, categories, recent rows, trend. Query: `trend=weekly` or `monthly`, `recentLimit`. |

---

## Running tests (automated)

```bash
npm run test
```

Runs a few checks (for example health and auth) without needing MongoDB running for those tests.

---

## Project folders

| Folder | Contents |
|--------|----------|
| `server/` | Express API, models, routes, validation, seed script. |
| `client/` | React + Vite app; in dev it proxies `/api` to the server. |

---

## If something fails

| Symptom | What to try |
|---------|-------------|
| Cannot connect to MongoDB | Check `MONGODB_URI`, password, and Atlas **Network Access**. |
| `JWT_SECRET` error | Must be set and at least 16 characters. |
| Port in use | Change `PORT` in `server/.env` or stop the other process. |
| Blank dashboard after login | Run `npm run seed` once; check Atlas that data exists. |
| 403 on Records as viewer | Expected — viewers only see the dashboard. |

---

## Design notes (for your report)

- **JWT in the browser** is stored in `localStorage` in this demo; production apps often prefer httpOnly cookies.
- **Soft delete** keeps old rows in the database but hides them from totals and lists.
- **Rate limits** apply to `/api/auth` and `/api` routes to reduce abuse.

---

## Deploying (short)

You can host the API on services like **Render** or **Railway**: set the same env vars (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`), use **Root directory** `server`, build `npm install`, start `npm start`. Run `npm run seed` once from your machine against the same Atlas database if you need the admin user.
