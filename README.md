<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./apps/web/public/icon.svg">
    <img src="./apps/web/public/icon.svg" width="128" height="128" alt="notFredoHub logo">
  </picture>
</p>

<h1 align="center">notFredoHub</h1>

<p align="center">Complete team management system for FredoCloud.</p>

<p align="center">
  <a href="https://github.com/WhiteHades/notfredohub/actions"><img alt="build" src="https://img.shields.io/badge/build-passing-1c1917?style=flat-square"></a>
  <a href="#"><img alt="license" src="https://img.shields.io/badge/license-MIT-1c1917?style=flat-square"></a>
  <a href="https://notfredohub.mohammedefaz.com"><img alt="production" src="https://img.shields.io/badge/production-live-c8102e?style=flat-square"></a>
  <a href="#stack"><img alt="stack" src="https://img.shields.io/badge/monorepo-turborepo-1c1917?style=flat-square"></a>
  <a href="#tests"><img alt="tests" src="https://img.shields.io/badge/tests-21%20passing-1c1917?style=flat-square"></a>
</p>

<br>

## What is this

A full-stack workspace application where teams manage shared goals, post announcements, track action items, and stay in sync in real time. Built for the FredoCloud technical assessment on a strict grid system with one disciplined accent colour.

<br>

## Live

| Service | URL |
|---|---|
| Web | [`https://notfredohub.mohammedefaz.com`](https://notfredohub.mohammedefaz.com) |
| API | [`https://api.notfredohub.mohammedefaz.com`](https://api.notfredohub.mohammedefaz.com) |
| Swagger | [`/api/docs`](https://api.notfredohub.mohammedefaz.com/api/docs) |

**Demo login:** `demo@notfredohub.test` / `demo12345`

<p align="center">
  <br>
  <img alt="features" src="https://img.shields.io/badge/auth-cookie_JWT-1c1917?style=flat-square">
  <img alt="workspaces" src="https://img.shields.io/badge/workspaces-multi_tenant-1c1917?style=flat-square">
  <img alt="goals" src="https://img.shields.io/badge/goals-milestones_%2B_feed-1c1917?style=flat-square">
  <img alt="announcements" src="https://img.shields.io/badge/announcements-rich_text_%2B_reactions-1c1917?style=flat-square">
  <img alt="action items" src="https://img.shields.io/badge/action_items-kanban_%2B_list-1c1917?style=flat-square">
  <img alt="realtime" src="https://img.shields.io/badge/realtime-socket.io_presence-1c1917?style=flat-square">
  <img alt="analytics" src="https://img.shields.io/badge/analytics-recharts_%2B_csv-1c1917?style=flat-square">
  <img alt="rbac" src="https://img.shields.io/badge/advanced-rbac_permissions-c8102e?style=flat-square">
  <img alt="audit" src="https://img.shields.io/badge/advanced-audit_log_%2B_csv-c8102e?style=flat-square">
  <img alt="theme" src="https://img.shields.io/badge/bonus-dark_%2F_light-c8102e?style=flat-square">
  <img alt="email" src="https://img.shields.io/badge/bonus-nodemailer-c8102e?style=flat-square">
  <img alt="cmd" src="https://img.shields.io/badge/bonus-ctrl%2Bk_palette-c8102e?style=flat-square">
  <img alt="swagger" src="https://img.shields.io/badge/bonus-openapi_docs-c8102e?style=flat-square">
  <img alt="pwa" src="https://img.shields.io/badge/bonus-pwa_shell-c8102e?style=flat-square">
  <img alt="tests" src="https://img.shields.io/badge/bonus-jest_%2B_rtl-c8102e?style=flat-square">
</p>

<br>

## Stack

| Area | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js App Router (JavaScript) |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Auth | JWT access + refresh cookies |
| Real-time | Socket.io |
| Storage | Cloudinary |
| Deploy | Railway |

<br>

## Advanced features

1. **RBAC** — Permission matrix controlling goal creation, announcement publishing, invitations, and more. Defaults per role with per-member overrides.
2. **Audit log** — Immutable event trail for workspace mutations. Filterable timeline UI with CSV export.

<br>

## Layout

```text
apps/
  api/        Express API, Prisma schema, migrations, seed, tests
  web/        Next.js App Router, dashboard panels, web tests
packages/
  shared/     Shared constants
```

<br>

## Run locally

You need Node.js, npm, and a running PostgreSQL instance.

```bash
# clone
git clone git@github.com:WhiteHades/notfredohub.git
cd notfredohub

# install
npm install

# start postgres (Docker one-liner)
docker run -d --name notfredohub-postgres \
  -e POSTGRES_DB=notfredohub \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

# set up env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# migrate and seed
npm run db:migrate --workspace=apps/api -- --name local_setup
npm run db:seed --workspace=apps/api

# start
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) and log in with `demo@notfredohub.test` / `demo12345`.

<br>

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start both apps |
| `npm run build` | Production build |
| `npm run test` | All tests (API + web) |
| `npm run lint` | Lint everything |
| `npm run db:migrate --workspace=apps/api` | Run Prisma migrations |
| `npm run db:seed --workspace=apps/api` | Seed demo workspace |
| `npm run db:generate --workspace=apps/api` | Regenerate Prisma client |

<br>

## Environment

### API (`apps/api/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `JWT_ACCESS_SECRET` | Yes | JWT access token signing |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token signing |
| `CLIENT_URL` | Yes | CORS origin |
| `CLOUDINARY_CLOUD_NAME` | No | Avatar upload |
| `CLOUDINARY_API_KEY` | No | Avatar upload |
| `CLOUDINARY_API_SECRET` | No | Avatar upload |
| `SMTP_HOST` | No | Email delivery |
| `SMTP_USER` | No | Email delivery |
| `SMTP_PASS` | No | Email delivery |
| `SMTP_FROM` | No | Email delivery |
| `DEMO_EMAIL` | No | Seed account email |
| `DEMO_PASSWORD` | No | Seed account password |

### Web (`apps/web/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | API origin |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.io origin |

<br>

## Known limitations

- Cloudinary avatar upload needs runtime credentials on the API service
- Nodemailer hooks need valid SMTP credentials for actual email delivery
- Custom domain setup pending Porkbun DNS API access enablement
- The command palette is navigation-focused, not a full action runner

<br>

<p align="center">
  <sub>Built with Swiss precision. Grid-first. One accent. No decoration beyond what the data asks for.</sub>
</p>
