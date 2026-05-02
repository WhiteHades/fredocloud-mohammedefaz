<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./apps/web/public/icon.svg">
    <img src="./apps/web/public/icon.svg" width="128" height="128" alt="notFredoHub logo">
  </picture>
</p>

<h1 align="center">notFredoHub</h1>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
  <img src="https://img.shields.io/badge/deploy-Railway-%23000000" alt="Railway">
  <img src="https://img.shields.io/badge/frontend-Next.js%2016-black" alt="Next.js">
  <img src="https://img.shields.io/badge/backend-Express-333" alt="Express">
  <img src="https://img.shields.io/badge/db-PostgreSQL%20%2B%20Prisma-336791" alt="PostgreSQL + Prisma">
</p>

<br>

<p align="center">Collaborative team hub. Workspaces, goals, announcements, and action items in real time.</p>

https://github.com/user-attachments/assets/7162fa4a-17df-485e-a4bc-ad296800bee5

### `Live`

| Service | URL |
|---|---|
| Web | [`https://notfredohub.mohammedefaz.com`](https://notfredohub.mohammedefaz.com) |
| Web (direct) | [`https://web-production-7acc2.up.railway.app`](https://web-production-7acc2.up.railway.app) |
| API | [`https://fredocloud-mohammedefaz-production.up.railway.app`](https://fredocloud-mohammedefaz-production.up.railway.app) |
| API Docs | [`https://fredocloud-mohammedefaz-production.up.railway.app/api/docs`](https://fredocloud-mohammedefaz-production.up.railway.app/api/docs) |

**Demo login:** `demo@notfredohub.test` / `demo12345`

<br>

### `Features`

- Email/password authentication with cookie JWT sessions
- Multi-workspace creation, switching, invitations, and role-based membership
- Goals with nested milestones and progress updates
- Announcements with rich text, pinning, reactions, comments, and file attachments
- Action items with list and kanban views
- Live workspace presence, realtime panel refresh via Socket.io
- Mention notifications with in-app delivery
- Analytics dashboard with completion chart (Recharts) and CSV export

**Advanced:**
- RBAC permission matrix with per-member overrides
- Immutable audit timeline with CSV export

**Bonus:**
- Dark/light theme toggle
- Email notifications (Nodemailer hooks)
- Command palette (`Ctrl+K`)
- Unit & integration tests (Jest + Supertest + RTL)
- API documentation at `/api/docs`
- Installable PWA shell

<br>

### `Stack`

| Area | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js App Router (JavaScript) |
| Styling | Tailwind CSS + shadcn/ui (Luma) |
| State | Zustand |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Auth | JWT access + refresh cookies |
| Real-time | Socket.io |
| Storage | Cloudinary |
| Deploy | Railway |

<br>

### `Layout`

```text
apps/
  api/        Express API, Prisma schema, migrations, seed, tests
  web/        Next.js App Router, dashboard panels, web tests
packages/
  shared/     Shared constants
```

<br>

### `Run locally`

You need Node.js, npm, and a running PostgreSQL instance.

```bash
git clone git@github.com:WhiteHades/notfredohub.git
cd notfredohub

npm install

# postgres (Docker one-liner)
docker run -d --name notfredohub-postgres \
  -e POSTGRES_DB=notfredohub \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

npm run db:migrate --workspace=apps/api -- --name local_setup
npm run db:seed --workspace=apps/api
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) and log in with `demo@notfredohub.test` / `demo12345`.

<br>

### `Scripts`

| Command | Purpose |
|---|---|
| `npm run dev` | Start both apps |
| `npm run build` | Production build |
| `npm run test` | All tests |
| `npm run lint` | Lint |
| `npm run db:migrate --workspace=apps/api` | Prisma migrations |
| `npm run db:seed --workspace=apps/api` | Seed demo |
| `npm run db:generate --workspace=apps/api` | Regenerate Prisma client |

<br>

### `Environment`

#### API (`apps/api/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `JWT_ACCESS_SECRET` | Yes | JWT signing |
| `JWT_REFRESH_SECRET` | Yes | JWT signing |
| `CLIENT_URL` | Yes | CORS origin |
| `CLOUDINARY_CLOUD_NAME` | No | Avatar and attachment upload |
| `SMTP_HOST` | No | Email delivery |

Full list in `apps/api/.env.example`.

#### Web (`apps/web/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | API origin |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.io origin |

<br>

<br>
