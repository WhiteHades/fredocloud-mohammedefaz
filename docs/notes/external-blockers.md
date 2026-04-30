# External Blockers

## Railway CLI authentication

- Date observed: 2026-05-01
- Command: `railway project list --json`
- Result: `Unauthorized. Please run railway login again.` after an OAuth refresh failure (`invalid_grant`).
- Resolution: user re-authenticated with `railway login`, so Railway provisioning and deployment work can continue.

## Cloudinary runtime verification

- Date observed: 2026-05-01
- Local state: `apps/api/.env` does not contain `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, or `CLOUDINARY_API_SECRET` values.
- Impact: The avatar upload route is implemented, but local end-to-end upload verification returns a guarded `503` until real Cloudinary credentials are present in the app runtime environment.
- Mitigation while blocked: keep the upload route and dashboard UI in place, wire Railway environment variables during deployment, and re-run the avatar flow once the runtime secrets are available.
