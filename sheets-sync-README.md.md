# Google Sheet → Dashboard

The sheet stays the source of truth. Edit a row, and the dashboard follows
within 15 minutes — or immediately via **Dashboard → Sync now**.

## What it does

- **New row** → creates a project
- **Edited row** → updates that project
- **Renamed project** → renames it, rather than creating a duplicate
- **Untouched rows** → skipped entirely, so a sync costs nothing when nothing changed
- **Deleted row** → left alone in the dashboard (delete there if you want it gone)

## 1. Add two columns

**Date** — add it to both tabs, as a column titled `Date`. Format the cells as a
date (Format → Number → Date) or type `YYYY-MM-DD`. Blank is fine; the project
just has no date.

**Dashboard ID** — don't create this. The first sync adds it and fills it in.
It's how a row stays linked to its project when you rename it, so **don't edit
or delete that column**. If you clear a cell, that row is matched by name again
on the next sync.

Everything else stays as it is: `No.`, `Playlist`, `Brand Name`, `Drive Links`,
`Youtube Links`, and the section headers.

## 2. Install the script

1. Open the sheet → **Extensions → Apps Script**
2. Delete whatever's there, paste in `Code.gs` from this folder
3. Fill in the top:
   ```js
   const CONFIG = {
     BASE_URL: 'https://your-app.onrender.com',   // no trailing slash, no /api
     SECRET:   'the same string as INTAKE_SECRET on the server',
     SYNC_EVERY_MINUTES: 15,
   };
   ```
4. Save, then run **checkSetup** from the function dropdown. Google asks for
   permission the first time — **Advanced → Go to (project name)** past the
   "unverified app" warning, since it's your own script.
5. Read what `checkSetup` reports: which columns it found and how many rows it
   can see per tab. Fix anything marked MISSING before going further.
6. Run **setup**. It installs the timer and does a first full sync.

The first run pushes every row, so it takes a couple of minutes. After that only
changed rows are sent.

Reload the sheet and you'll have a **Dashboard** menu with *Sync now*,
*Sync everything*, and *Check setup*.

## How categories are decided

From the Playlist column and the section headers already in the sheet:

| Sheet grouping | Dashboard category |
|---|---|
| Brand Campaigns · Zomato · Entertainment · Digital Films and TVCs · F&B, FMCG · Fashion and Retail | Campaigns |
| Corporate | Corporate Films |
| Events | Event Films |
| Podcasts · Retainers | Social |
| BTS *(Internal Work)* | BTS |
| Internal Marketing *(Internal Work)* | Social |

To change any of these, edit the `groups` block near the top of `Code.gs`. A
grouping the script doesn't recognise falls back to Campaigns for Client Work
and BTS for Internal Work.

## Renaming safely

Rename a project in the sheet and the dashboard follows — as long as its
**Dashboard ID** cell is filled. That only happens after the row has synced once.

So: let the first sync finish before renaming anything in bulk. A row renamed
while its ID cell is still empty is treated as a brand-new project.

## When something fails

A row that can't sync gets `ERROR: <reason>` written into its Dashboard ID cell,
so you can see exactly which rows need attention. Fix the row and it retries on
the next sync.

| Message | Cause |
|---|---|
| `Invalid or missing intake secret` | `CONFIG.SECRET` doesn't match `INTAKE_SECRET` on the server |
| `Intake is not configured` | `INTAKE_SECRET` isn't set on the server, or the deploy didn't pick it up |
| `matches N projects` | Two projects share that name and the category doesn't separate them — rename one in the sheet, or fill its Dashboard ID by hand from the dashboard URL |
| `no longer exists` | The Dashboard ID points at a deleted project — clear that cell and it'll be recreated |
| `HTTP 0` or a timeout | The app was asleep. It retries; if it keeps failing, open the dashboard once to wake it |

Full logs live under **Executions** in the Apps Script sidebar.

## Cost of running

Only changed rows are sent, so a quiet 15-minute cycle makes zero requests. A
full re-sync of ~120 rows uses ~120 requests, well inside Apps Script's daily
allowance. Use **Sync everything** sparingly.

## If you also set up the Google Form

Both can run at once — they write through the same endpoint and both match on
project id. But two sources editing the same projects will overwrite each other,
so pick one as the place people actually enter work. The sheet is the simpler
choice if your team already keeps it up to date.