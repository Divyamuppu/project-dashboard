-- Google Form intake support.
--
-- Adds the fields the form feeds (a project date), a marker for where a row
-- came from, and an idempotency key so re-delivering the same form response
-- updates the existing project instead of creating a duplicate.

alter table projects
  add column if not exists project_date  date,
  add column if not exists source        text not null default 'manual'
    check (source in ('manual','form','import')),
  add column if not exists external_ref  text;

-- One project per form response. Partial, so manual rows (null ref) are exempt.
create unique index if not exists uq_projects_external_ref
  on projects (external_ref) where external_ref is not null;

create index if not exists idx_projects_project_date
  on projects (project_date desc nulls last);

-- Same idea for links: a form response's links are replaced on redelivery
-- rather than appended, so edits in the sheet don't pile up duplicates.
alter table project_links
  add column if not exists source text not null default 'manual'
    check (source in ('manual','form','import'));

-- Views need rebuilding to expose the new column set.
drop view if exists v_portfolio_summary;
create view v_portfolio_summary as
select
  (select count(*) from projects)                                 as total_projects,
  (select count(*) from projects where status = 'live')            as live_projects,
  (select count(*) from projects where status = 'draft')           as draft_projects,
  (select count(*) from project_links where type = 'video')        as total_video_links,
  (select count(*) from project_links where type = 'portfolio')    as total_portfolio_links;

-- Backfill: rows created by the bulk spreadsheet import are tagged so they can
-- be told apart from anything typed into the dashboard by hand.
update projects
set source = 'import'
where source = 'manual'
  and created_at < now()
  and exists (
    select 1 from activity_log
    where action_type = 'bulk_import'
  )
  and created_by is null;
