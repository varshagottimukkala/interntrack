require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REF = 'ciwjsbcnxidurzgkxzfm';

const statements = [
  `create extension if not exists "uuid-ossp"`,
  `create table if not exists profiles (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    full_name text,
    password_hash text not null,
    created_at timestamp default now()
  )`,
  `create table if not exists items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade,
    title text,
    description text,
    ai_summary text,
    company text,
    status text default 'wishlist',
    deadline text,
    location text,
    created_at timestamp default now()
  )`,
  `alter table profiles enable row level security`,
  `alter table items enable row level security`,
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'users_select_own_profile') then
      create policy users_select_own_profile on profiles for select using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'users_update_own_profile') then
      create policy users_update_own_profile on profiles for update using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'users_select_own_items') then
      create policy users_select_own_items on items for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'users_insert_own_items') then
      create policy users_insert_own_items on items for insert with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'users_update_own_items') then
      create policy users_update_own_items on items for update using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'items' and policyname = 'users_delete_own_items') then
      create policy users_delete_own_items on items for delete using (auth.uid() = user_id);
    end if;
  end $$`,
  `grant usage on schema public to anon, authenticated, service_role`,
  `grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role`,
  `grant usage, select on all sequences in schema public to anon, authenticated, service_role`,
];

const endpoints = [
  { name: 'pg/query', url: `${URL}/pg/query`, wrap: (sql) => ({ query: sql }) },
  { name: 'pg/query-sql', url: `${URL}/pg/query`, wrap: (sql) => ({ sql }) },
  { name: 'postgres/v1/query', url: `${URL}/postgres/v1/query`, wrap: (sql) => ({ query: sql }) },
  { name: 'rest rpc exec_sql', url: `${URL}/rest/v1/rpc/exec_sql`, wrap: (sql) => ({ query: sql }) },
  { name: 'rest rpc sql', url: `${URL}/rest/v1/rpc/sql`, wrap: (sql) => ({ query: sql }) },
  {
    name: 'mgmt database/query',
    url: `https://api.supabase.com/v1/projects/${REF}/database/query`,
    wrap: (sql) => ({ query: sql }),
  },
];

async function probe(ep, sql) {
  const res = await fetch(ep.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(ep.wrap(sql)),
  });
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 500) };
}

async function main() {
  console.log('Checking existing tables via REST...');
  for (const table of ['profiles', 'items']) {
    const res = await fetch(`${URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const text = await res.text();
    console.log(`REST ${table}:`, res.status, text.slice(0, 200));
  }

  console.log('\nProbing SQL endpoints with SELECT 1...');
  const working = [];
  for (const ep of endpoints) {
    try {
      const r = await probe(ep, 'select 1 as ok;');
      console.log(ep.name, r.status, r.text);
      if (r.status >= 200 && r.status < 300) working.push(ep);
    } catch (err) {
      console.log(ep.name, 'ERR', err.message);
    }
  }

  if (!working.length) {
    console.log('\nNo SQL endpoint accepted SELECT 1. Trying statements anyway on pg/query...');
    working.push(endpoints[0]);
  }

  const ep = working[0];
  console.log('\nRunning DDL via', ep.name);
  for (const sql of statements) {
    try {
      const r = await probe(ep, sql);
      console.log('---');
      console.log(sql.slice(0, 80).replace(/\s+/g, ' '));
      console.log(r.status, r.text);
    } catch (err) {
      console.log('ERR', err.message);
    }
  }

  console.log('\nRe-check tables...');
  for (const table of ['profiles', 'items']) {
    const res = await fetch(`${URL}/rest/v1/${table}?select=id&limit=1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const text = await res.text();
    console.log(`REST ${table}:`, res.status, text.slice(0, 200));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
