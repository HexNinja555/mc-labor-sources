#!/usr/bin/env node
/**
 * Smoke-test key Supabase RPCs using demo auth users.
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Demo users must exist (pnpm seed:auth).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const PASSWORD = process.env.SMOKE_DEMO_PASSWORD || 'Password123!';

const USERS = [
  { label: 'admin', email: 'admin@mclabor.demo', rpcs: ['get_admin_dashboard_stats'] },
  {
    label: 'supervisor',
    email: 'supervisor@mclabor.demo',
    rpcs: ['get_supervisor_dashboard_stats'],
  },
];

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

function dateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

async function callRpc(client, name, args = {}) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return data;
}

async function smokeUser(url, anonKey, user) {
  const client = createClient(url, anonKey);
  const { error: signInError } = await client.auth.signInWithPassword({
    email: user.email,
    password: PASSWORD,
  });
  if (signInError) throw new Error(`${user.label} sign-in: ${signInError.message}`);

  for (const rpc of user.rpcs) {
    const data = await callRpc(client, rpc);
    if (data === null || data === undefined) {
      throw new Error(`${user.label} ${rpc}: empty response`);
    }
    console.log(`  ok ${rpc}`);
  }

  if (user.label === 'admin') {
    const { from, to } = dateRange();
    await callRpc(client, 'get_admin_hours_report', {
      p_from: from,
      p_to: to,
      p_customer_id: null,
      p_job_site_id: null,
    });
    console.log('  ok get_admin_hours_report');
  }

  if (user.label === 'supervisor') {
    const { from, to } = dateRange();
    await callRpc(client, 'get_supervisor_hours_report', {
      p_from: from,
      p_to: to,
      p_job_site_id: null,
    });
    console.log('  ok get_supervisor_hours_report');
  }

  await client.auth.signOut();
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required in .env');
  }

  console.log('RPC smoke test…');
  for (const user of USERS) {
    console.log(`\n${user.label} (${user.email})`);
    await smokeUser(url, anonKey, user);
  }
  console.log('\nAll RPC smoke checks passed.');
}

main().catch((err) => {
  console.error('\nRPC smoke test failed:', err.message);
  process.exit(1);
});
