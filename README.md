# MC Labor Sources — Workforce Management Platform

Supabase-first workforce management: web and mobile talk directly to **Supabase** (Auth, Postgres with RLS, Storage). No Prisma. No NestJS API.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Web Portal** | Next.js 15, Supabase JS, TanStack Query, Tailwind |
| **Database** | Supabase Postgres + SQL migrations + RLS |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Mobile** | Expo, Supabase JS |
| **Edge Functions** | `create-app-user` (admin user provisioning) |

## Prerequisites

- Node.js 20+
- pnpm 9+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Supabase cloud project (client invites you)

## Setup

### 1. Install

```bash
cd mc-labor-sources
cp .env.example .env
pnpm install
```

Fill `.env` with values from **Supabase Dashboard → Settings → API**.

### 2. Link Supabase project

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Apply schema + seed

```bash
supabase db push          # runs migrations in supabase/migrations/
# seed.sql runs via config if using db reset locally; for remote:
psql $DATABASE_URL -f supabase/seed.sql   # or Supabase SQL editor

pnpm setup:check
pnpm seed:auth            # creates demo Auth users + links profiles
```

In Supabase dashboard:
- **Auth → Email** → disable **Confirm email** (demo)
- **Storage** → create buckets: `documents`, `signatures`, `safety-bulletins`
- Deploy edge function: `supabase functions deploy create-app-user`

### 4. Run web app

```bash
pnpm dev
```

Open http://localhost:3000

### 5. Mobile (optional)

```bash
cd apps/mobile
pnpm start
```

## Demo Logins

Password for all: **`Password123!`**

| Role | Email |
|------|-------|
| Admin | admin@mclabor.demo |
| Customer | customer@mclabor.demo |
| Supervisor | supervisor@mclabor.demo |
| Worker | worker@mclabor.demo |

## Architecture

```
Web/Mobile → Supabase Auth (signInWithPassword)
Web/Mobile → Supabase Postgres (RLS enforces roles)
Admin creates users → Edge Function create-app-user (service role)
```

RLS helper functions: `is_admin()`, `get_my_role()`, `get_my_customer_id()`, etc.

## Project Structure

```
mc-labor-sources/
├── apps/
│   ├── admin-web/       # Next.js portal
│   └── mobile/          # Expo app
├── packages/shared/     # Enums, Zod schemas
├── supabase/
│   ├── migrations/      # SQL schema + RLS + RPC
│   ├── seed.sql         # Demo business data
│   └── functions/       # Edge functions
└── scripts/
    ├── check-supabase-env.mjs
    └── seed-auth-users.mjs
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web portal |
| `pnpm build` | Production build |
| `pnpm setup:check` | Validate `.env` |
| `pnpm seed:auth` | Link demo users in Supabase Auth |
| `supabase db push` | Apply migrations to linked project |

## License

Proprietary — MC Labor Sources, Inc.
