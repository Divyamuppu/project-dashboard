-- Open access for the no-auth build.
--
-- ⚠️  This makes the portfolio readable AND writable by anyone who can reach
--     your Supabase URL with the anon key. Only run this for local use or a
--     deployment behind your own network/VPN. Do NOT run it on a public site.
--     To re-enable sign-in later, run 0003_restore_auth.sql (see README).

-- Drop the auth-gated policies from 0001.
drop policy if exists "read_members"       on team_members;
drop policy if exists "read_projects"      on projects;
drop policy if exists "read_links"         on project_links;
drop policy if exists "read_activity"      on activity_log;
drop policy if exists "write_projects"     on projects;
drop policy if exists "update_projects"    on projects;
drop policy if exists "delete_projects"    on projects;
drop policy if exists "write_links"        on project_links;
drop policy if exists "write_activity"     on activity_log;
drop policy if exists "update_own_profile" on team_members;
drop policy if exists "admin_manage_members" on team_members;

-- Full access for the anon role.
create policy "open_projects"      on projects      for all using (true) with check (true);
create policy "open_project_links" on project_links for all using (true) with check (true);
create policy "open_activity_log"  on activity_log  for all using (true) with check (true);
create policy "open_team_members"  on team_members  for all using (true) with check (true);

-- activity_log.actor_id is nullable, so unattributed writes are fine as-is.
