#!/usr/bin/env node
/**
 * Creates Supabase Auth demo users and links auth_user_id on public.users rows.
 * Run after supabase db push + seed.sql:
 *   node scripts/seed-auth-users.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { updateUserSchema } from '../packages/shared/dist/schemas.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) throw new Error('Missing .env at project root');
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    vars[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return vars;
}

const PASSWORD = 'Password123!';

const DEMO_USERS = [
  { email: 'superadmin@mclabor.demo', name: 'System Administrator', role: 'SUPER_ADMIN' },
  { email: 'admin@mclabor.demo', name: 'Admin User', role: 'ADMIN' },
  { email: 'supervisor@mclabor.demo', name: 'Site Supervisor', role: 'SUPERVISOR' },
  { email: 'customer@mclabor.demo', name: 'Summit Portal User', role: 'CUSTOMER' },
  { email: 'worker@mclabor.demo', name: 'Marcus Johnson', role: 'WORKER' },
];

async function ensureAuthUser(supabase, email, password, name, role) {
  const normalized = email.toLowerCase();
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata: { role },
  });
  if (!error && created.user) return created.user.id;

  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = listed?.users?.find((u) => u.email?.toLowerCase() === normalized);
  if (existing) {
    updateUserSchema.parse({
      name,
      email: normalized,
      password,
      role,
    });
    await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role },
    });
    return existing.id;
  }
  throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
}

async function main() {
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env');

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Linking Supabase Auth users to app profiles...');

  for (const u of DEMO_USERS) {
    const authUserId = await ensureAuthUser(supabase, u.email, PASSWORD, u.name, u.role);
    const { error } = await supabase
      .from('users')
      .update({ auth_user_id: authUserId })
      .eq('email', u.email.toLowerCase());
    if (error) throw new Error(`Failed to link ${u.email}: ${error.message}`);
    console.log(`  Linked ${u.email}`);
  }

  console.log('\nDone. Demo password for all: Password123!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
