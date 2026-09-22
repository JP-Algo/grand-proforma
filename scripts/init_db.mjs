/**
 * Creates the grand725 schema and its two tables. Safe to re-run.
 * Reads DATABASE_URL from the environment or from a .env file passed as argv[2].
 */
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

let url = process.env.DATABASE_URL;
const envFile = process.argv[2];
if (!url && envFile) {
  const line = readFileSync(envFile, 'utf8').split(/\r?\n/).find(l => l.startsWith('DATABASE_URL='));
  if (line) url = line.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
}
if (!url) { console.error('No DATABASE_URL. Pass a .env path: node scripts/init_db.mjs ../CRM/.env'); process.exit(1); }

const sql = neon(url);
await sql`create schema if not exists grand725`;
await sql`create table if not exists grand725.scenarios (
  id text primary key,
  name text not null,
  data jsonb not null,
  saved_at timestamptz not null default now()
)`;
await sql`create table if not exists grand725.working_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
)`;
const [{ count }] = await sql`select count(*)::int as count from grand725.scenarios`;
console.log(`grand725 schema ready. scenarios rows: ${count}`);
