# External Blockers

## Custom domain (Porkbun DKIM/DNS)

- Date observed: 2026-05-01
- Resolution: API access for `mohammedefaz.com` was enabled via Porkbun dashboard. DNS CNAME records for `notfredohub` and `api.notfredohub` created successfully. Both records point to their respective Railway services.

## Cloudinary runtime verification

- Date observed: 2026-05-01
- Local state: `apps/api/.env` does not contain `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, or `CLOUDINARY_API_SECRET` values.
- Impact: The avatar upload route is implemented, but local end-to-end upload verification returns a guarded `503` until real Cloudinary credentials are present in the app runtime environment.
- Mitigation while blocked: keep the upload route and dashboard UI in place, wire Railway environment variables during deployment, and re-run the avatar flow once the runtime secrets are available.
