# External Blockers

## Custom domain (Porkbun DKIM/DNS)

- Date observed: 2026-05-01
- Domain `mohammedefaz.com` is active in the Porkbun account.
- DNS management API returns `HTTP 400` — likely because the domain does not use Porkbun's nameservers or API access is not enabled per-domain.
- Resolution: enable Porkbun DNS management or API access for `mohammedefaz.com` from the Porkbun dashboard.
- Impact: custom domain (`notfredohub.mohammedefaz.com`) cannot be provisioned until DNS API access is enabled.
- Railway-generated domains are available and functional as fallback URLs.

## Cloudinary runtime verification

- Date observed: 2026-05-01
- Local state: `apps/api/.env` does not contain `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, or `CLOUDINARY_API_SECRET` values.
- Impact: The avatar upload route is implemented, but local end-to-end upload verification returns a guarded `503` until real Cloudinary credentials are present in the app runtime environment.
- Mitigation while blocked: keep the upload route and dashboard UI in place, wire Railway environment variables during deployment, and re-run the avatar flow once the runtime secrets are available.
