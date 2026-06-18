# Milestones 1–4 — Acceptance Checklist

Password for all demo users: **`Password123!`**

Use this document to sign off the complete MC Labor Sources workforce platform (M1–M4).

---

## Prerequisites

| Step | Command / action |
|------|------------------|
| Env configured | `pnpm setup:check` |
| Migrations applied | `supabase db push` (through `20250623000001_milestone4_notifications.sql`) |
| Demo business data | `seed.sql` or [`seed-incremental.sql`](../supabase/seed-incremental.sql) on remote |
| Auth users linked | `pnpm seed:auth` |
| Edge functions deployed | See [DEPLOYMENT.md](DEPLOYMENT.md) |
| Automated RPC smoke | `pnpm smoke:rpc` |
| Build verification | `pnpm verify` |

---

## Milestone 1 — Admin, customer portal, auth

| Step | Action | Expected |
|------|--------|----------|
| M1.1 | Login as `admin@mclabor.demo` | Admin dashboard loads |
| M1.2 | CRUD employees, customers, job sites | Create/edit/list works |
| M1.3 | Create assignments | Assignment appears on admin + customer views |
| M1.4 | Login as `customer@mclabor.demo` | Customer portal (not admin) |
| M1.5 | Customer dashboard, job sites, attendance | Data scoped to Summit customer |
| M1.6 | Settings: save company profile | Persists after reload |
| M1.7 | Create customer user via admin (if used) | Edge function `create-app-user` succeeds |

---

## Milestone 2 — Worker mobile + admin operations

| Step | Action | Expected |
|------|--------|----------|
| M2.1 | Login `worker@mclabor.demo` in Expo | Worker tabs (Home, Assignments, Clock, Profile) |
| M2.2 | Clock in / out on assigned site | Attendance log created |
| M2.3 | View assignments and job orders | Worker-scoped data only |
| M2.4 | Acknowledge job order (if sent) | Status updates |
| M2.5 | Admin: create + **Send** job order | Worker receives **in-app notification** |
| M2.6 | Admin: upload document | Listed on documents page |
| M2.7 | Admin: safety bulletin — **All employees** | Send creates worker notifications |
| M2.8 | Admin: safety bulletin — **Specific job site** | Only workers on that site notified |
| M2.9 | Admin: safety bulletin — **Specific workers** | Only selected workers notified |
| M2.10 | Admin: create/rollup timesheet | Timesheet appears in list |
| M2.11 | Worker mobile timesheets | Read-only list + detail |

---

## Milestone 3 — Supervisor portal, signing, reports

| Step | Action | Expected |
|------|--------|----------|
| M3.1 | Admin `/supervisors` — assign sites | Supervisor linked to job sites |
| M3.2 | Login `supervisor@mclabor.demo` (web) | Supervisor dashboard loads (no RPC 400) |
| M3.3 | Supervisor timesheets — sign pending | Status `SIGNED`, signature stored |
| M3.4 | Customer `/customer/timesheets` — View | Entries + signature image |
| M3.5 | Customer receives **in-app notification** on sign | Notification visible to customer user |
| M3.6 | Admin `/reports` — hours rollup + CSV | Cross-customer data |
| M3.7 | Supervisor `/supervisor/reports` — hours + CSV | Assigned sites only |
| M3.8 | Supervisor mobile — sign timesheet | Canvas works (native or web fallback) |
| M3.9 | Admin attendance/timesheets CSV export | Downloads file |

---

## Milestone 4 — Email, push, production deploy

| Step | Action | Expected |
|------|--------|----------|
| M4.1 | Admin Settings — configure SMTP, send test email | Test email received |
| M4.2 | Enable email; send job order | Worker gets in-app + email |
| M4.3 | Send safety bulletin | Workers get in-app + email |
| M4.4 | Sign timesheet | Customer gets in-app + email |
| M4.5 | Mark timesheet sent | Office emails logged as SENT in `email_delivery_log` |
| M4.6 | Mobile login (push enabled) | Row in `push_device_tokens` |
| M4.7 | Trigger notification on device | Push received (native build or Expo Go) |
| M4.8 | Production URLs load | Admin + mobile web on Vercel |
| M4.9 | `pnpm verify` on CI | Green on main branch |

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel + Supabase setup steps.

---

## Automated checks

```bash
pnpm verify      # typecheck + production build
pnpm smoke:rpc   # admin + supervisor RPC health (requires .env + seed:auth)
```

---

## Sign-off

| Milestone | Tester | Date | Pass |
|-----------|--------|------|------|
| M1 | | | ☐ |
| M2 | | | ☐ |
| M3 | | | ☐ |
| M4 | | | ☐ |

**Client / PM approval:** _____________________________  Date: __________
