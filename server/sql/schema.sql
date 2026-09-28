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
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
