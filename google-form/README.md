# Google Form → Dashboard

One form does both jobs. Pick a project from the **Which project?** dropdown to
**update** it; leave that on "＋ New project" to **create** one.

## 1. Build the form

| Question | Type | Notes |
|---|---|---|
| **Which project?** | **Dropdown** | Filled automatically by the script. Leave on "＋ New project" for new work |
| Brand Name | Short answer | Stored as the client, shown beside the project name |
| Project Name | Short answer | The name on the card. Leave blank when updating to keep the current one |
| Date | Date | Defaults to the submission date |
| Drive Link | Paragraph | Paste as many URLs as you like — commas, spaces or new lines |
| YouTube Link | Paragraph | Joins the Drive links as video links |
| Portfolio Link | Paragraph | Behance, your site, case studies |
| Category | Multiple choice | Social · Campaigns · Corporate Films · Event Films · BTS |
| Status | Multiple choice | Live · Draft |
| Description | Paragraph | One line about the project |

Only **Which project?** has to be a Dropdown — the script writes its options.
Create it with one placeholder choice; the first sync replaces that.

Wording is flexible: the script matches on keywords, so "Brand" or "Client Name"
both feed the brand field. Run `showFormQuestions()` to see exactly what maps
where before any data moves.

Nothing is required except identifying the project — either pick it from the
dropdown, or type a Brand/Project name for a new one.

## 2. Set the secret on the server

Pick a long random string:

```bash
openssl rand -hex 32
```

Add it to your hosting environment (Render → your service → Environment) as:

```
INTAKE_SECRET=<that string>
```

Save and let it redeploy. Unlike `DATABASE_URL` this one is **not**
`NEXT_PUBLIC_` — it must never reach the browser.

Confirm the endpoint is live by opening it in a browser:

```
https://your-app.onrender.com/api/intake
```

You should see JSON with `"configured": true`. If it says `false`, the variable
didn't take — check the spelling and redeploy.

## 3. Install the script

1. Open your form → ⋮ menu (top right) → **Apps Script**
2. Delete whatever's in the editor, paste in `Code.gs` from this folder
3. Fill in the two values at the top:
   ```js
   const CONFIG = {
     BASE_URL: 'https://your-app.onrender.com',   // no trailing slash, no /api
     SECRET:   'the same string you set as INTAKE_SECRET',
   };
   ```
4. Save (⌘S)
5. Pick **setup** from the function dropdown → **Run**. This installs the
   submit trigger, adds an hourly job that keeps the dropdown current, and
   fills the dropdown for the first time.
6. Google asks for permission the first time — review and allow. The
   "unverified app" warning is expected for your own script: **Advanced → Go to
   (project name)**.
7. Pick **showFormQuestions** → **Run** and read **Execution log** — confirm
   every question maps where you expect, especially **Which project?**
8. Pick **testConnection** → **Run** and check the log again

A working test logs status 200 and puts a draft project called
"Connection test — safe to delete" in the dashboard. Delete it there.

## 4. Submit a real response

Fill in the form. The project appears in the dashboard within a few seconds — on
the right category page, with its links clickable and a small **Form** badge on
the card.

## Updating projects that already exist

**Pick the project from the dropdown.** That's the whole mechanism — it's matched
by database id, so there's no typing, no spelling risk, and no way to update the
wrong one. The list is ordered by category, so all the Campaigns entries sit
together, then Corporate Films, and so on.

What a submission does to the project you picked:

| You fill in | What happens |
|---|---|
| Project Name | Renames it |
| Brand Name | Sets the client shown beside the name |
| Date | Sets the project date |
| Drive / YouTube Link | Added as video links |
| Portfolio Link | Added as portfolio links |
| Category | Moves it to that category |
| Status | Live or draft |
| *(left blank)* | **Left exactly as it is** |

Two rules make this safe to use for one-field corrections:

**Blank fields are left alone.** Fill in only what you're changing. An empty
Brand Name box doesn't erase the brand already on record.

**Links are added, never removed.** A new Drive link joins the existing ones.
Submitting a link that's already there is skipped rather than duplicated. To
remove a link, use the dashboard — Admin login, then the ✕ beside it.

### Keeping the dropdown current

It refreshes hourly, right after any submission that creates a project, and
whenever you run `syncProjectList()` by hand. If you add a project directly in
the dashboard and want it selectable straight away, run that function.

If someone picks a project that has since been deleted, the submission is
refused with a clear message rather than creating a stray duplicate.

## Backfilling and recovery

**Responses collected before you installed the script:** run `resendAll` from the
editor. It pushes every response through, and it's safe to run more than once —
anything already sent is updated rather than duplicated.

**A submission didn't arrive:** the script retries three times, then emails the
form owner. Once the dashboard is reachable again, `resendAll` catches everything
up.

## Troubleshooting

| What you see | Cause |
|---|---|
| `401` in the log | `CONFIG.SECRET` doesn't match `INTAKE_SECRET`. Watch for trailing spaces |
| `503` | `INTAKE_SECRET` isn't set on the server, or the deploy didn't pick it up |
| `422` with "Unrecognised category" | The form option doesn't map to a category — check `FIELD_MATCHERS` in `Code.gs` |
| `409` "matches N projects" | A typed name exists in two categories — pick the project from the dropdown instead |
| `422` "no longer exists" | The dropdown is stale — run `syncProjectList()` |
| Dropdown is empty or stale | Run `syncProjectList()`; check the hourly trigger under ⏰ **Triggers** |
| Every submission creates a new project | No **Which project?** dropdown found — run `showFormQuestions()` to confirm |
| Nothing happens on submit | The trigger isn't installed. Run `setup` again, then check ⏰ **Triggers** in the sidebar |
| Links missing from the card | The question title didn't match. Add your wording to `FIELD_MATCHERS.drive_links` |

Execution logs live under **Executions** in the Apps Script sidebar — every
submission shows up there with what was sent and what came back.

## A note on access

The endpoint is protected by the shared secret only. That's appropriate for a
form bridge, but it means anyone holding the secret can write to your portfolio —
keep it out of screenshots and shared docs, and rotate it (change both sides) if
it leaks.
