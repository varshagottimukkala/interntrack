const { sb } = require('./supabase');

const SQL = `
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  password_hash text not null,
  created_at timestamp default now()
);

create table if not exists items (
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
);

alter table profiles enable row level security;
alter table items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'users_select_own_profile') then
    create policy users_select_own_profile on profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_update_own_profile') then
    create policy users_update_own_profile on profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_select_own_items') then
    create policy users_select_own_items on items for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_insert_own_items') then
    create policy users_insert_own_items on items for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_update_own_items') then
    create policy users_update_own_items on items for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users_delete_own_items') then
    create policy users_delete_own_items on items for delete using (auth.uid() = user_id);
  end if;
end $$;
`;

async function execSql(sql) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: 'Missing Supabase credentials' };

  const endpoints = [
    { url: `${url}/pg/query`, body: { query: sql } },
    { url: `${url}/postgres/v1/query`, body: { query: sql } },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(ep.body),
      });
      const text = await res.text();
      if (res.ok) {
        return { ok: true, via: ep.url, body: text.slice(0, 400) };
      }
    } catch {
      /* try next */
    }
  }
  return { ok: false, error: 'SQL HTTP endpoints unavailable' };
}

async function ensureSchema() {
  const sqlResult = await execSql(SQL);

  try {
    const { error: pErr } = await sb('profiles', { query: { select: 'id', limit: '1' } });
    const { error: iErr } = await sb('items', { query: { select: 'id', limit: '1' } });

    if (!pErr && !iErr) {
      return { ready: true, method: sqlResult.ok ? 'sql+verify' : 'tables-exist' };
    }

    return {
      ready: false,
      method: 'pending',
      sql: sqlResult,
      profilesError: pErr?.message,
      itemsError: iErr?.message,
    };
  } catch (err) {
    return { ready: false, error: err.message, sql: sqlResult };
  }
}

module.exports = { ensureSchema, execSql, SQL };
