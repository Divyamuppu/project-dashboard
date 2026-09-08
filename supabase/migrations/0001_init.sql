-- a-tom Portfolio Dashboard — initial schema
-- Apply with `supabase db push`, or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

create type project_category as enum ('social','campaigns','corporate','events','bts');
create type project_status   as enum ('live','draft');
create type link_type        as enum ('video','portfolio');

-- ── Team ────────────────────────────────────────────────────────────────
create table team_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

-- ── Projects ────────────────────────────────────────────────────────────
create table projects (
  id uuid primary key default gen_random_uuid(),
  category project_category not null,
  name text not null,
  client text,
  description text,
  status project_status not null default 'draft',
  created_by uuid references team_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Both video links and portfolio links live here, distinguished by `type`.
-- A project can have any number of each.
create table project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type link_type not null,
  label text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references team_members(id),
  project_id uuid references projects(id) on delete set null,
  action_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index idx_projects_category on projects(category);
create index idx_projects_created on projects(created_at desc);
create index idx_links_project on project_links(project_id);
create index idx_activity_created on activity_log(created_at desc);

-- keep updated_at honest
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_projects_touch before update on projects
for each row execute function touch_updated_at();

-- ── Provision a team_members row on signup ──────────────────────────────
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.team_members (auth_user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- ── Dashboard counts, computed in one query ─────────────────────────────
create view v_category_stats as
select
  c.category,
  count(p.id)                                            as total,
  count(p.id) filter (where p.status = 'live')            as live,
  count(p.id) filter (where p.status = 'draft')           as draft,
  coalesce(sum(l.video_count), 0)::bigint                 as video_links,
  coalesce(sum(l.portfolio_count), 0)::bigint             as portfolio_links
from (select unnest(enum_range(null::project_category)) as category) c
left join projects p on p.category = c.category
left join lateral (
  select
    count(*) filter (where type = 'video')     as video_count,
    count(*) filter (where type = 'portfolio') as portfolio_count
  from project_links where project_id = p.id
) l on true
group by c.category;

create view v_portfolio_summary as
select
  (select count(*) from projects)                                  as total_projects,
  (select count(*) from projects where status = 'live')             as live_projects,
  (select count(*) from projects where status = 'draft')            as draft_projects,
  (select count(*) from project_links where type = 'video')         as total_video_links,
  (select count(*) from project_links where type = 'portfolio')     as total_portfolio_links;

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table team_members  enable row level security;
alter table projects      enable row level security;
alter table project_links enable row level security;
alter table activity_log  enable row level security;

-- Any signed-in team member can read everything.
create policy "read_members"  on team_members  for select using (auth.uid() is not null);
create policy "read_projects" on projects      for select using (auth.uid() is not null);
create policy "read_links"    on project_links for select using (auth.uid() is not null);
create policy "read_activity" on activity_log  for select using (auth.uid() is not null);

-- Any signed-in team member can create and edit portfolio entries.
create policy "write_projects" on projects for insert
  with check (exists (select 1 from team_members where auth_user_id = auth.uid()));
create policy "update_projects" on projects for update
  using (exists (select 1 from team_members where auth_user_id = auth.uid()));

-- Only the creator or an admin can delete a project.
create policy "delete_projects" on projects for delete using (
  exists (select 1 from team_members m
          where m.auth_user_id = auth.uid()
            and (m.role = 'admin' or m.id = projects.created_by))
);

create policy "write_links" on project_links for all
  using (exists (select 1 from team_members where auth_user_id = auth.uid()))
  with check (exists (select 1 from team_members where auth_user_id = auth.uid()));

create policy "write_activity" on activity_log for insert
  with check (auth.uid() is not null);

create policy "update_own_profile" on team_members for update using (auth_user_id = auth.uid());
