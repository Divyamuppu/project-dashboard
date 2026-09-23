-- Defence in depth: make the anon key read-only.
--
-- OPTIONAL but recommended. Run this only once SUPABASE_SERVICE_ROLE_KEY is set
-- in your server environment, because after this migration every write goes
-- through the service role. Without that key set, the dashboard can still read
-- but adding or editing a project will fail.
--
-- Why bother: the app already blocks viewers (middleware + requireAdmin on every
-- server action) and the anon key never reaches the browser. This adds a last
-- line — if the anon key ever leaks, it cannot be used to alter the portfolio.

drop policy if exists "open_projects"      on projects;
drop policy if exists "open_project_links" on project_links;
drop policy if exists "open_activity_log"  on activity_log;
drop policy if exists "open_team_members"  on team_members;

-- Read for anyone holding the anon key (that is the server, rendering pages).
create policy "anon_read_projects"      on projects      for select using (true);
create policy "anon_read_project_links" on project_links for select using (true);
create policy "anon_read_activity_log"  on activity_log  for select using (true);
create policy "anon_read_team_members"  on team_members  for select using (true);

-- Writes require the service role, which bypasses RLS. No insert/update/delete
-- policy exists for anon, so those are refused at the database.

-- To undo, re-run 0002_disable_auth.sql.
