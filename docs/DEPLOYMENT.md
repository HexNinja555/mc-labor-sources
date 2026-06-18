# Production Deployment — MC Labor Sources

Hosting stack: **Supabase cloud** (database, auth, storage, edge functions) + **Vercel** (admin web + mobile web).

---

## 1. Supabase production project

### Link and migrate

```bash
cd mc-labor-sources
supabase login
supabase link --project-ref YOUR_PROD_PROJECT_REF
supabase db push
```

Migrations must include through `20250623000001_milestone4_notifications.sql`.

### Dashboard setup

| Area | Action |
|------|--------|
| **Auth → Email** | Configure site URL and redirect URLs for production domain |
| **Auth → Providers** | Disable confirm email for demo/staging if needed |
| **Storage** | Create private buckets: `documents`, `signatures`, `safety-bulletins` |
| **Edge Functions → Secrets** | Set `SMTP_PASS`, `MC_LABOR_OFFICE_EMAIL`, `WEB_APP_URL` |

### Deploy edge functions

```bash
supabase functions deploy create-app-user
supabase functions deploy bulk-create-workers
supabase functions deploy send-transactional-email
supabase functions deploy send-test-email
supabase functions deploy send-push-notification
```

### Production seed

- **Do not** run full `seed.sql` on production.
- Create initial admin via Supabase Auth dashboard or `pnpm seed:auth` with production `.env` (demo users only for staging).

---

## 2. Vercel — Admin web (`apps/admin-web`)

### Project settings

| Setting | Value |
|---------|-------|
| Root directory | `mc-labor-sources/apps/admin-web` |
| Framework | Next.js |
| Install command | `cd ../.. && pnpm install` |
| Build command | `cd ../.. && pnpm build` |

Or use [`apps/admin-web/vercel.json`](apps/admin-web/vercel.json) from monorepo root with adjusted paths.

### Environment variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `WEB_APP_URL` | Yes — production URL (e.g. `https://portal.mclabor.com`) |

---

## 3. Vercel — Mobile web (`apps/mobile`)

Second Vercel project using [`apps/mobile/vercel.json`](apps/mobile/vercel.json).

| Variable | Required |
|----------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes |

---

## 4. SMTP email (Milestone 4)

1. Configure SMTP host, port, user, from name/email in **Admin → Settings**.
2. Set `SMTP_PASS` as a Supabase Edge Function secret (never in the database or client).
3. Enable **Email delivery** toggle in Settings.
4. Send a test email from Settings before going live.

Transactional emails fire on:

- Job order send → worker email
- Safety bulletin send → worker emails
- Timesheet sign → customer office email
- Timesheet mark sent → customer office + `MC_LABOR_OFFICE_EMAIL`

In-app notifications remain the primary channel; email is additive.

---

## 5. Push notifications (Milestone 4)

1. Enable **Push notifications** in Admin → Settings.
2. Mobile app registers Expo push tokens on worker/supervisor login.
3. For native iOS/Android builds:
   - Create Firebase project
   - Run `eas credentials` for FCM / APNs
   - Store `FIREBASE_*` in EAS secrets (see `.env.example`)

Push delivery uses the Expo Push API via the `send-push-notification` edge function.

---

## 6. Custom domain

1. Add domain in Vercel project settings (e.g. `portal.mclabor.com`).
2. Update Supabase Auth **Site URL** and **Redirect URLs** to match.
3. Set `WEB_APP_URL` in Vercel and Supabase edge function secrets.
4. Optional: store `dashboard_subdomain` in `company_settings` for documentation.

---

## 7. Secrets matrix

| Secret | Where |
|--------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Local `.env` only — never expose to client |
| `SMTP_PASS` | Supabase Edge Function secret |
| `MC_LABOR_OFFICE_EMAIL` | Supabase Edge Function secret |
| `WEB_APP_URL` | Vercel env + Supabase Edge Function secret |
| `FIREBASE_*` | EAS secrets (native builds) |

---

## 8. Rollback

- Database: restore Supabase point-in-time backup or revert migration manually.
- Edge functions: redeploy previous version from git tag.
- Vercel: instant rollback to prior deployment in dashboard.

---

## 9. Post-deploy verification

```bash
pnpm verify
pnpm smoke:rpc    # against staging/prod .env
```

Manual: complete [`docs/M1-M4-ACCEPTANCE.md`](M1-M4-ACCEPTANCE.md).
