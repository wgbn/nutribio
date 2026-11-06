-- Phase 4.3 — database role, grants, auth.users foreign keys and updated_at
-- triggers (DECISIONS #37).
--
-- Model:
--   * All application data lives in the private `app` schema (not exposed by
--     the Data API).
--   * RLS is enabled on every table with NO policies.
--   * The Nuxt API connects as `nutribio_api` (login + bypassrls) and is the
--     only reader/writer.
--   * `anon`/`authenticated` keep no privileges at all (defense in depth, in
--     addition to the schema not being exposed).
--
-- The role password is NOT stored in the repository: set it once per
-- environment (see docs/ARCHITECTURE.md §15 / the owner guide).

-- ---------------------------------------------------------------------------
-- 1. API role
--
-- Preferred: a login role with BYPASSRLS (new tables just work through the
-- default privileges below). If the executing role is not allowed to grant
-- BYPASSRLS (some hosted projects restrict it), the role is created without it
-- and the per-table `api_all` policies added at the end of this section take
-- over — the API keeps working either way.
-- ---------------------------------------------------------------------------
do $$
declare
  tables_without_policy text;
begin
  if not exists (select 1 from pg_roles where rolname = 'nutribio_api') then
    begin
      execute 'create role nutribio_api login bypassrls noinherit';
    exception when insufficient_privilege then
      execute 'create role nutribio_api login noinherit';
    end;
  end if;

  if not coalesce((select rolbypassrls from pg_roles where rolname = 'nutribio_api'), false) then
    for tables_without_policy in
      select tablename from pg_tables where schemaname = 'app'
    loop
      execute format('drop policy if exists api_all on app.%I', tables_without_policy);
      execute format(
        'create policy api_all on app.%I for all to nutribio_api using (true) with check (true)',
        tables_without_policy
      );
    end loop;
    raise notice 'nutribio_api created without BYPASSRLS — using per-table policies instead';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Foreign keys to the Supabase-managed auth schema
--    (`auth.users` is not modelled in Drizzle; deleting a user cascades).
-- ---------------------------------------------------------------------------
alter table app.profiles
  add constraint profiles_user_id_fk
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table app.profile_history
  add constraint profile_history_user_id_fk
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table app.bio_records
  add constraint bio_records_user_id_fk
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table app.plans
  add constraint plans_user_id_fk
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table app.consents
  add constraint consents_user_id_fk
  foreign key (user_id) references auth.users (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 3. updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger profiles_set_updated_at
  before update on app.profiles
  for each row execute function app.set_updated_at();

create trigger bio_records_set_updated_at
  before update on app.bio_records
  for each row execute function app.set_updated_at();

create trigger plans_set_updated_at
  before update on app.plans
  for each row execute function app.set_updated_at();

create trigger plan_selections_set_updated_at
  before update on app.plan_selections
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Privileges
-- ---------------------------------------------------------------------------
-- The API role owns the access; client roles get nothing.
revoke all on schema app from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema app from anon';
    execute 'revoke all on all tables in schema app from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema app from authenticated';
    execute 'revoke all on all tables in schema app from authenticated';
  end if;
end
$$;

grant usage on schema app to nutribio_api;
grant select, insert, update, delete on all tables in schema app to nutribio_api;
alter default privileges in schema app
  grant select, insert, update, delete on tables to nutribio_api;
