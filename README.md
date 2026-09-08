# a-tom Portfolio Dashboard

Portfolio vault for a-tom Collective, organised by content vertical. Every project
holds any number of **video links** and **portfolio links**, with full CRUD on both.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind · Supabase (Postgres, Auth, RLS)

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

## Setup

1. **Create a Supabase project.** Copy the URL and anon key from Settings → API.
2. **Env:** `cp .env.example .env.local` and fill in the two `NEXT_PUBLIC_*` values.
3. **Schema:** run `supabase db push`, or paste these into the SQL editor in order:
   - `supabase/migrations/0001_init.sql` — enums, tables, views, triggers
   - `supabase/migrations/0002_disable_auth.sql` — opens access (required, see below)
4. **Sample data (optional):** paste `supabase/seed.sql` — 10 projects across all five
   categories with multiple links each.
5. **Run:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000 — straight to the dashboard, no sign-in.

## Access model — no sign-in

Sign-in has been removed. There is no login page, no middleware, and anyone who opens
the app gets full read/write access to every project and link.

**This means anyone who can reach your Supabase URL with the anon key can read, edit,
and delete your portfolio.** That's fine for running locally or behind your own
network. Do not deploy it to a public URL in this state.

`0002_disable_auth.sql` is what opens the database policies to match. Without it the
app will load but every query returns empty, because the original policies require a
signed-in user.

### Putting sign-in back

1. Run `supabase/migrations/0003_restore_auth.sql` to restore the auth-gated policies.
2. Restore the login page, `/auth/callback` route, and `src/middleware.ts`
   (all present in the previous version of this project).
3. In `src/app/actions/projects.ts`, restore the real `currentMemberId()` lookup and
   the `if (!memberId) return ...` guards — the current stub returns `null` and is
   marked with a comment.

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
- Video file uploads to Supabase Storage (currently the app stores links, which is the
  right default — hosting the files yourself is a cost and transcoding decision).
- Thumbnail previews auto-fetched from YouTube/Vimeo oEmbed.
- Tags and per-project cover images for a public-facing portfolio page.
