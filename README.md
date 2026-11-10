# a-tom Portfolio Dashboard

Portfolio vault for a-tom Collective, organised by content vertical. Every project
holds any number of **video links** and **portfolio links**, with full CRUD on both.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind · Neon (serverless Postgres)

## Categories

Social · Campaigns · Corporate Films · Event Films · BTS

They're a Postgres enum (`project_category`) mirrored in `src/types/database.ts`.
To add a sixth: `alter type project_category add value 'newkey';` then add it to the
`CATEGORIES` array in that file. Nothing else needs touching.

## What works end to end

- **Add project from the dashboard** — button sits top-right of the Dashboard header.
  Opens a dialog with name, client, category, status, description, and repeatable
  video/portfolio link rows.
- **Add project inside each category** — same dialog, category pre-filled, on every
  one of the five category pages (plus an empty-state button when a category is bare).
- **Multiple links of both kinds** — "+ Add another video link" / "+ Add another
  portfolio link" in the dialog; no cap. Links are stored in `project_links`,
  distinguished by a `type` column.
- **Full CRUD**
  - Projects: create, read, update (Edit dialog), delete (cascades to links), plus a
    live/draft status toggle.
  - Links: create in the dialog or via quick-add on the card (`+ Video link` /
    `+ Portfolio link`), edit inline in the Edit dialog, delete from the card.
  - Edits reconcile the whole link set — removed rows are deleted, kept rows updated,
    new rows inserted, in one save.
- **Global search** — matches project name, client, description, link labels, and link
  URLs. Searching part of a YouTube URL surfaces the project holding it.
- **Live counts** — total/live/draft projects and video/portfolio link tallies, per
  category and overall, computed in Postgres views (not in JS).
- **Activity feed** — every create, update, delete, status change, and link change is
  logged and shown on the dashboard.
- Loading, empty, and error states throughout; validation on both client and server.

## Access — public to view, password to edit

The dashboard opens straight from the link. Anyone with the URL can browse every
category, open links and search. Editing is locked behind **Admin login** in the
top right.

| | Anyone with the link | Admin |
|---|---|---|
| Browse, search, open links | yes | yes |
| Add / edit / delete projects | — | yes |
| Add / remove links | — | yes |
| Live–draft toggle | — | yes |

Two environment variables:

```
ADMIN_PASSWORD=<long random string>
SESSION_SECRET=<openssl rand -hex 32>
```

Unlocking sets an HMAC-signed, HttpOnly cookie on that browser, good for 30 days.
**Lock** in the header clears it. The signature is checked on every request, so
the cookie can't be hand-written to grant admin.

**The UI hiding buttons is not the security boundary.** Every write action calls
`requireAdmin()` on the server before touching the database, so anyone invoking
an action directly is still refused.

Rotating the password: change the env var and redeploy. Changing `SESSION_SECRET`
logs out every unlocked browser immediately — that's the lever if it leaks.

> **The portfolio is public.** Anyone with the URL sees every project and every
> Drive link, including unreleased client work. If that isn't what you want,
> restore the full gate — `git revert` the commit that removed
> `src/middleware.ts`, or ask for it back.

Nothing but the app's own server holds `DATABASE_URL`, and it never reaches
the browser — so there's no public database credential to protect. That's why
the schema has no row-level security: there is no second client to defend
against.

## Google Sheet sync

The portfolio spreadsheet pushes itself to the dashboard — new rows create
projects, edited rows update them, renames follow rather than duplicating.

- Script + setup: **`sheets-sync/README.md`**
- Runs every 15 minutes, plus a **Dashboard → Sync now** menu in the sheet
- Only changed rows are sent, so an idle cycle costs nothing
- Needs `INTAKE_SECRET` on the server and a `Date` column in the sheet

A `Dashboard ID` column is added automatically on first sync; it's what keeps a
row linked to its project across renames, so leave it alone.

## Google Form intake

Submissions to a Google Form create projects in the dashboard automatically, and
editing a past response updates that same project rather than duplicating it.

- Endpoint: `POST /api/intake`, protected by a shared secret (`x-intake-secret`)
- Apps Script bridge + full setup steps: **`google-form/README.md`**
- Requires `INTAKE_SECRET` in the server environment and migration `0004`

Form fields map to: date, project name, category, client, status, description,
drive/video links, portfolio links. A field can hold several URLs separated by
commas, spaces or new lines — each becomes its own link. Submissions with no
category are filed under Campaigns rather than rejected.

Check it's live by opening `/api/intake` in a browser — it reports whether the
secret is configured, without writing anything.

## Setup

1. **Create a Neon project** at neon.tech. From the dashboard, copy the
   **pooled** connection string (Connection Details → Pooled connection — the
   host contains `-pooler`).

2. **Env:** `cp .env.example .env.local` and fill in:
   ```
   DATABASE_URL=postgresql://…-pooler….neon.tech/neondb?sslmode=require
   ADMIN_PASSWORD=<long random string>
   SESSION_SECRET=<openssl rand -hex 32>
   INTAKE_SECRET=<openssl rand -hex 32>
   ```

3. **Schema:** one file, safe to re-run.
   ```bash
   psql "$DATABASE_URL" -f db/migrations/0001_init.sql
   ```
   Or paste it into Neon's SQL Editor. `npm run db:push` does the same.

4. **Run:**
   ```bash
   npm install
   npm run dev
   ```
   The dashboard loads read-only; use **Admin login** in the header to edit.

### Deploying to Vercel

Set all four environment variables in Project Settings → Environment Variables,
then redeploy. Missing `DATABASE_URL` is the usual cause of a server-side
exception on a fresh deployment.

## Notes

- Server Actions (`src/app/actions/projects.ts`) handle all writes, then
  `revalidatePath` refreshes the affected pages — so counts and the activity feed
  update immediately after any change.
- URLs are normalised on save (a bare `youtube.com/x` becomes `https://youtube.com/x`)
  and rejected if they don't parse.
- `progress`-style derived numbers come from `v_category_stats` /
  `v_portfolio_summary`, so the dashboard stays fast as the library grows.
- Next.js is pinned to 15.5.21 to stay clear of the Server Actions disclosure CVE in
  earlier 15.x releases.

## Where this could go next

- Realtime subscriptions so an open dashboard updates when a teammate adds a project.
- Video file uploads to object storage (currently the app stores links, which is the
  right default — hosting the files yourself is a cost and transcoding decision).
- Thumbnail previews auto-fetched from YouTube/Vimeo oEmbed.
- Tags and per-project cover images for a public-facing portfolio page.
