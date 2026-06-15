#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const placeholders = [
  'your-project-ref',
  'your-anon-key',
  'your-service-role-key',
  'your-password',
  'YOUR_PROJECT_REF',
  'YOUR_DB_PASSWORD',
];

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

if (!existsSync(envPath)) {
  console.error('Missing .env — copy .env.example to .env and fill in Supabase values.');
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, 'utf8'));
const errors = [];

for (const key of required) {
  const value = env[key];
  if (!value) {
    errors.push(`Missing ${key}`);
    continue;
  }
  for (const ph of placeholders) {
    if (value.includes(ph)) {
      errors.push(`${key} still contains placeholder "${ph}"`);
    }
  }
}

if (errors.length) {
  console.error('\nSupabase .env is not ready:\n');
  errors.forEach((e) => console.error(`  - ${e}`));
  console.error('\nGet values from https://supabase.com/dashboard → your project → Settings → API.\n');
  process.exit(1);
}

console.log('Supabase .env looks configured.');
console.log('Next: supabase link && supabase db push && pnpm seed:auth && pnpm dev');
