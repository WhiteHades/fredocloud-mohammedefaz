# External Blockers

## Custom domain (Porkbun DKIM/DNS)

- Date observed: 2026-05-01
- Resolution: API access for `mohammedefaz.com` was enabled via Porkbun dashboard. DNS CNAME records for `notfredohub` and `api.notfredohub` created successfully. Both records point to their respective Railway services.

## Cloudinary runtime verification

- Date observed: 2026-05-01
- Resolution: Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) set on Railway API service on 2026-05-01. Avatar upload endpoint now functional in production.

## Demo user seeding

- Date observed: 2026-05-01
- Resolution: Seed script (`prisma/seed.js`) now runs automatically on API server startup via `execSync` in `server.js`. Demo user (`demo@notfredohub.test` / `demo12345`) is created or updated via upsert on every deploy.

## Login CORS / Server Action failures

- Date observed: 2026-05-01
- Resolution: 
  - Added `action` attribute to auth form pointing to API endpoint, preventing Next.js Server Action interception when JS fails to load.
  - Added try/catch around fetch() to handle network/CORS errors gracefully instead of leaving button stuck on "Submitting…".
  - Expanded CORS allowed origins to include both the custom domain and the Railway web URL so login works from either entry point.
  - API root redirect now uses `config.clientUrl` instead of hardcoded Railway URL.
