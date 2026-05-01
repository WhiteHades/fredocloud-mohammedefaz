# notFredoHub

notFredoHub is a Swiss-styled collaborative team hub built for the FredoCloud technical assessment. It keeps workspaces, goals, announcements, action items, audit history, notifications, and live presence in one monorepo with a separate Next.js frontend and Express API.

## What Was Built

- Email/password authentication with cookie-based access and refresh tokens
- Protected dashboard route with profile editing and avatar upload flow
- Multi-workspace creation, switching, invitations, and membership roles
- Goals with milestones and progress updates
- Announcements with pinning, reactions, and comments
- Action items with list and kanban views
- Live workspace presence, live panel refreshes, and mention notifications
- Dashboard analytics with Recharts and CSV export

## Advanced Features Chosen

1. Advanced RBAC
2. Audit log

## Bonus Features Implemented

- Dark / light theme via system preference detection
- Email notifications through Nodemailer hooks
- `Ctrl+K` command palette for navigation
- Jest + Supertest backend tests
- React Testing Library frontend tests
- OpenAPI / Swagger docs at `/api/docs`
- PWA shell with manifest and service worker registration

## Stack

- Turborepo
- Next.js App Router in JavaScript
- Tailwind CSS
- Zustand
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT in httpOnly cookies
- Socket.io
- Cloudinary
- Railway

## Monorepo Layout

```text
apps/
  api/        Express API, Prisma schema, tests, seed script
  web/        Next.js App Router frontend, dashboard panels, web tests
packages/
  shared/     Shared constants
```

## Local Setup

1. Install dependencies:

```bash
/home/efaz/.volta/bin/npm install
```

2. Start a local PostgreSQL instance if you are not using Railway yet:

```bash
docker run -d --name notfredohub-postgres -e POSTGRES_DB=notfredohub -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

3. Copy environment examples if needed:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

4. Apply the database and seed the demo workspace:

```bash
/home/efaz/.volta/bin/npm run db:migrate --workspace=apps/api -- --name local_setup
/home/efaz/.volta/bin/npm run db:seed --workspace=apps/api
```

5. Run the monorepo:

```bash
/home/efaz/.volta/bin/npm run dev
```

6. Verify everything:

```bash
/home/efaz/.volta/bin/npm run test
/home/efaz/.volta/bin/npm run lint
/home/efaz/.volta/bin/npm run build
```

## Environment Variables

### API

See `apps/api/.env.example`.

Required for core runtime:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`

Optional but required for full integrations:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `DEMO_EMAIL`
- `DEMO_PASSWORD`

### Web

See `apps/web/.env.example`.

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## Demo Account

- Email: `demo@notfredohub.test`
- Password: `demo12345`

The local seed script creates a demo workspace with a goal, milestones, an announcement, and action items.

## Railway Deployment Notes

The intended Railway setup is one project with:

- `api` service
- `web` service
- PostgreSQL plugin

Recommended service commands:

### API service

- Build: `npm install && npm run build --workspace=apps/api && npm run db:generate --workspace=apps/api`
- Start: `npm run db:deploy --workspace=apps/api && npm run start --workspace=apps/api`

### Web service

- Build: `npm install && npm run build --workspace=apps/web`
- Start: `npm run start --workspace=apps/web -- --hostname 0.0.0.0 --port $PORT`

Set `DATABASE_URL` from the Railway PostgreSQL plugin on the API service, and point `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` at the deployed API URL on the web service.

## Known Limitations

- Cloudinary avatar upload requires real Cloudinary runtime credentials in the API environment. Without them, the route fails gracefully with a clear error.
- Nodemailer hooks are implemented, but actual email delivery depends on valid SMTP credentials.
- The command palette is navigation-focused rather than a full action runner.

## Submission Checklist Status

- Public GitHub repo with conventional commit history
- README with setup, environment, advanced feature selection, and limitations
- Seeded demo account and seed script
- Swagger docs route
- Tests, lint, and build all passing locally

## Live URLs

- Web: pending Railway deploy
- API: pending Railway deploy
