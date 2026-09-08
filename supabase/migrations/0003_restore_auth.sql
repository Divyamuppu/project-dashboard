-- Restore sign-in-gated access (reverses 0002_disable_auth.sql).
-- Run this alongside re-adding the login page and middleware in the app.

drop policy if exists "open_projects"      on projects;
drop policy if exists "open_project_links" on project_links;
drop policy if exists "open_activity_log"  on activity_log;
drop policy if exists "open_team_members"  on team_members;

create policy "read_members"  on team_members  for select using (auth.uid() is not null);
create policy "read_projects" on projects      for select using (auth.uid() is not null);
create policy "read_links"    on project_links for select using (auth.uid() is not null);
create policy "read_activity" on activity_log  for select using (auth.uid() is not null);

create policy "write_projects" on projects for insert
  with check (exists (select 1 from team_members where auth_user_id = auth.uid()));
create policy "update_projects" on projects for update
  using (exists (select 1 from team_members where auth_user_id = auth.uid()));
create policy "delete_projects" on projects for delete using (
  exists (select 1 from team_members m
          where m.auth_user_id = auth.uid()
            and (m.role = 'admin' or m.id = projects.created_by))
);

create policy "write_links" on project_links for all
  using (exists (select 1 from team_members where auth_user_id = auth.uid()))
  with check (exists (select 1 from team_members where auth_user_id = auth.uid()));

create policy "write_activity" on activity_log for insert with check (auth.uid() is not null);
create policy "update_own_profile" on team_members for update using (auth_user_id = auth.uid());
