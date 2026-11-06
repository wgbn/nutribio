-- Phase 4.3 verification (run with `npm run db:verify -w @nutribio/db`).
-- Every check raises an exception with a readable message when it fails, so the
-- script stops at the first regression.

\set ON_ERROR_STOP on

-- 1. Every table lives in `app` with RLS enabled.
do $$
declare missing text;
begin
  select string_agg(t, ', ') into missing
  from unnest(array[
    'profiles', 'profile_history', 'bio_records', 'plans', 'dishes',
    'plan_shopping_items', 'plan_selections', 'shopping_checks', 'consents'
  ]) as t
  where not exists (
    select 1 from pg_tables
    where schemaname = 'app' and tablename = t and rowsecurity
  );
  if missing is not null then
    raise exception 'tables missing or without RLS: %', missing;
  end if;
end $$;

-- 2. Client roles have no privileges on the app schema.
do $$
declare leaked text;
begin
  select string_agg(format('%s on %s', privilege_type, table_name), ', ') into leaked
  from information_schema.role_table_grants
  where table_schema = 'app' and grantee in ('anon', 'authenticated');
  if leaked is not null then
    raise exception 'client roles still hold privileges: %', leaked;
  end if;
  if has_schema_privilege('anon', 'app', 'usage')
     or has_schema_privilege('authenticated', 'app', 'usage') then
    raise exception 'client roles still hold USAGE on schema app';
  end if;
end $$;

-- 3. The API role can do everything it needs.
do $$
begin
  if not has_schema_privilege('nutribio_api', 'app', 'usage') then
    raise exception 'nutribio_api lacks USAGE on schema app';
  end if;
  if not has_table_privilege('nutribio_api', 'app.profiles', 'select,insert,update,delete') then
    raise exception 'nutribio_api lacks table privileges';
  end if;
  -- Either BYPASSRLS (preferred) or the per-table `api_all` policies.
  if not coalesce((select rolbypassrls from pg_roles where rolname = 'nutribio_api'), false)
     and not exists (
       select 1 from pg_policies
       where schemaname = 'app' and policyname = 'api_all' and 'nutribio_api' = any (roles)
     ) then
    raise exception 'nutribio_api can neither bypass RLS nor use api_all policies';
  end if;
end $$;

-- 4. Fixtures: a throwaway auth user + profile + plan.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at)
values ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', 'verify@nutribio.test', '', now(), now(), now());

insert into app.profiles (user_id, name, sex, age, height_cm, initial_weight_kg, goal, country, exercise, supplements, locale)
values ('00000000-0000-4000-8000-000000000001', 'Verify', 'male', 34, 178, 78.5, 'lose_fat', 'PT',
        '{"active": true, "frequency": "3_4", "intensity": "moderate", "type": "strength", "workoutTime": "07:30"}',
        '{"wheyProtein": false, "creatine": false}', 'pt-PT');

insert into app.plans (id, user_id, status, inputs_hash, locale, country, model, targets, profile_snapshot, is_current)
values ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001',
        'succeeded', 'hash-1', 'pt-PT', 'PT', 'gemini-2.5-flash', '{}',
        '{}', true);

-- 5. Constraint checks.
do $$
begin
  begin
    insert into app.bio_records (user_id, date, weight_kg)
    values ('00000000-0000-4000-8000-000000000001', '2026-11-01', 78);
    insert into app.bio_records (user_id, date, weight_kg)
    values ('00000000-0000-4000-8000-000000000001', '2026-11-01', 79);
    raise exception 'duplicate bio date was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into app.plans (id, user_id, status, inputs_hash, locale, country, model, targets, profile_snapshot, is_current)
    values ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-000000000001',
            'succeeded', 'hash-2', 'pt-PT', 'PT', 'gemini-2.5-flash', '{}', '{}', true);
    raise exception 'a second current plan was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into app.plans (id, user_id, status, inputs_hash, locale, country, model, targets, profile_snapshot)
    values ('00000000-0000-4000-8000-0000000000a3', '00000000-0000-4000-8000-000000000001',
            'queued', 'hash-3', 'pt-PT', 'PT', 'gemini-2.5-flash', '{}', '{}');
    insert into app.plans (id, user_id, status, inputs_hash, locale, country, model, targets, profile_snapshot)
    values ('00000000-0000-4000-8000-0000000000a4', '00000000-0000-4000-8000-000000000001',
            'running', 'hash-4', 'pt-PT', 'PT', 'gemini-2.5-flash', '{}', '{}');
    raise exception 'a second active generation job was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into app.profiles (user_id, sex, age, height_cm, initial_weight_kg, goal, country, exercise, supplements, locale)
    values ('00000000-0000-4000-8000-000000000002', 'male', 17, 178, 78.5, 'lose_fat', 'PT', '{}', '{}', 'pt-PT');
    raise exception 'under-18 profile was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into app.profiles (user_id, sex, age, height_cm, initial_weight_kg, goal, country, exercise, supplements, locale)
    values ('00000000-0000-4000-8000-000000000002', 'male', 30, 178, 78.5, 'bulk', 'PT', '{}', '{}', 'pt-PT');
    raise exception 'unknown goal was accepted';
  exception when check_violation then null;
  end;
end $$;

-- 6. updated_at trigger.
do $$
declare before_ts timestamptz;
begin
  select updated_at into before_ts from app.profiles
   where user_id = '00000000-0000-4000-8000-000000000001';
  perform pg_sleep(0.01);
  update app.profiles set age = 35
   where user_id = '00000000-0000-4000-8000-000000000001';
  if (select updated_at from app.profiles
       where user_id = '00000000-0000-4000-8000-000000000001') <= before_ts then
    raise exception 'updated_at trigger did not fire';
  end if;
end $$;

-- 7. Deleting the auth user cascades to every table.
do $$
begin
  delete from auth.users where id = '00000000-0000-4000-8000-000000000001';
  if exists (select 1 from app.profiles where user_id = '00000000-0000-4000-8000-000000000001')
     or exists (select 1 from app.plans where user_id = '00000000-0000-4000-8000-000000000001') then
    raise exception 'account deletion did not cascade';
  end if;
end $$;

\echo 'phase 4.3 database checks: OK'
