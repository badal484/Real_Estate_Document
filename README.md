# Contingency Deadline Copilot

> Help solo real-estate agents and small TC teams never miss a purchase-agreement contingency deadline.

## Project Structure

```
Real_Estate_Document/
├── dateEngine.js          # ✅ Core business/calendar-day engine (built + tested)
├── dateEngine.test.js     # ✅ Jest tests
├── package.json           # Root – date engine package
├── reference/             # Python mirror of date engine (reference only)
├── backend/               # Express + TypeScript + Prisma API
├── frontend/              # Next.js + TypeScript + Tailwind UI
├── docker-compose.yml     # Local PostgreSQL (Docker)
└── .env.example           # All environment variables documented
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22 | https://nodejs.org |
| npm | ≥ 10 | bundled with Node |
| Docker Desktop | latest | https://docker.com/products/docker-desktop |

---

## Quick Start (Local Dev)

### 1. Clone & install root deps (date engine)

```bash
git clone https://github.com/badal484/Real_Estate_Document.git
cd Real_Estate_Document
npm install
```

### 2. Start PostgreSQL via Docker

```bash
docker compose up -d
# Postgres will be available on localhost:5432
# Healthcheck runs every 5s — wait ~10s before next step
```

> **Optional pgAdmin UI** (DB browser):
> ```bash
> docker compose --profile tools up -d
> # Open http://localhost:5050  (admin@local.dev / admin)
> ```

### 3. Set up the backend

```bash
cd backend
cp ../.env.example .env          # copy template
# Edit .env — DATABASE_URL is pre-filled for Docker local setup

npm install
npx prisma generate              # generate Prisma client
npx prisma db push               # push schema to DB (creates tables)
npm run dev                      # starts on http://localhost:3001
```

Smoke test:
```bash
curl http://localhost:3001/health
# → { "status": "ok", "timestamp": "..." }

curl http://localhost:3001/api/deals
# → []
```

### 4. Set up the frontend

```bash
cd frontend
cp ../.env.example .env.local    # copy template (Next.js reads .env.local)
# NEXT_PUBLIC_API_URL=http://localhost:3001/api is pre-filled

npm install
npm run dev                      # starts on http://localhost:3000
```

Open **http://localhost:3000** — you should see the Upload page.

### 5. Run all tests

```bash
# Root date engine tests
cd Real_Estate_Document && npm test

# Backend tests
cd backend && npm test
```

---

## Environment Variables

See [`.env.example`](./.env.example) for the full list with descriptions.

Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Later | Claude API key (AI extraction — not yet active) |
| `TWILIO_ACCOUNT_SID` | Later | SMS alerts (not yet active) |
| `SENDGRID_API_KEY` | Later | Email alerts (not yet active) |
| `NEXT_PUBLIC_API_URL` | ✅ frontend | Backend API base URL |

---

## v1 Feature Scope

| Feature | Status |
|---------|--------|
| Date engine (business/calendar days) | ✅ Done |
| Project scaffold (backend + frontend) | ✅ Done |
| PDF upload endpoint | 🔜 Next |
| AI extraction (Claude) | 🔜 Next |
| Deadline confirmation UI | 🔜 Next |
| Timeline view | 🔜 Next |
| SMS / Email alerts | 🔜 Later |
| Auth (magic-link) | 🔜 Later |
| Payments (Stripe) | 🔜 Later |

---

## Deployment

| Service | What |
|---------|------|
| **Vercel** | Frontend (Next.js) |
| **Railway / Render / Fly.io** | Backend (Express) + Postgres |

Set all env vars in your host's dashboard — never commit `.env` files.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · pdf.js
- **Backend:** Node.js 22 · Express · TypeScript · tsx
- **Database:** PostgreSQL 16 · Prisma ORM
- **Date engine:** date-fns · date-holidays
- **AI:** @anthropic-ai/sdk (Claude) — stub, not active yet
- **Alerts:** Twilio · SendGrid — stub, not active yet
- **Payments:** Stripe — stub, not active yet
