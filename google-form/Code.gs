/**
 * a-tom Portfolio — Google Form → Dashboard bridge
 *
 * Fill in CONFIG, then run setup() once. After that:
 *   · every submission is pushed to the dashboard
 *   · the "Which project?" dropdown stays in sync with what's in the dashboard
 *
 * Picking a project from that dropdown UPDATES it. Leaving it on
 * "＋ New project" CREATES one. Full instructions in google-form/README.md.
 */

const CONFIG = {
  // Your deployed app, without a trailing slash.
  // e.g. https://project-dashboard-s2di.onrender.com
  BASE_URL: 'PASTE_YOUR_APP_URL_HERE',

  // Must match the INTAKE_SECRET environment variable on the server, exactly.
  SECRET: 'PASTE_YOUR_SECRET_HERE',
};

/** The dropdown option that means "this isn't in the dashboard yet". */
const NEW_PROJECT_OPTION = '＋ New project (not listed above)';

/**
 * Question matching. Titles don't have to match word for word — each field
 * takes the first question whose title contains any of these, case-insensitive.
 * Order matters: earlier fields claim a question first.
 */
const FIELD_MATCHERS = {
  existing:        ['which project', 'existing project', 'update existing', 'select project', 'project to update'],
  brand:           ['brand name', 'brand', 'client'],
  project:         ['project name', 'project title', 'campaign name', 'name of the project'],
  date:            ['date'],
  category:        ['category', 'vertical', 'playlist', 'type of work'],
  status:          ['status'],
  description:     ['description', 'notes', 'details', 'about'],
  drive_links:     ['drive link', 'drive', 'footage', 'raw file'],
  youtube_links:   ['youtube', 'yt link', 'video link', 'vimeo'],
  portfolio_links: ['portfolio', 'behance', 'case study', 'website'],
};

function endpoint(path) {
  return String(CONFIG.BASE_URL).replace(/\/+$/, '') + path;
}

function assertConfigured() {
  if (CONFIG.BASE_URL.indexOf('PASTE_') === 0 || CONFIG.SECRET.indexOf('PASTE_') === 0) {
    throw new Error('Fill in BASE_URL and SECRET in CONFIG first.');
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────

/** Run once from the editor. Installs both triggers and fills the dropdown. */
function setup() {
  assertConfigured();
  const form = FormApp.getActiveForm();

  // Clear triggers from any previous run so setup() is safe to repeat.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    const fn = t.getHandlerFunction();
    if (fn === 'onFormSubmit' || fn === 'syncProjectList') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  ScriptApp.newTrigger('syncProjectList').timeBased().everyHours(1).create();

  Logger.log('Triggers installed for: ' + form.getTitle());
  Logger.log('Posting to: ' + endpoint('/api/intake'));

  syncProjectList();

  Logger.log('');
  Logger.log('Next: run showFormQuestions() to check the field mapping.');
}

/**
 * Run this on an existing form before anything else.
 *
 * Lists every question and the dashboard field it feeds. Nothing is sent.
 * Anything marked NOT MAPPED is ignored on submit — if it matters, add a word
 * from its title to FIELD_MATCHERS above.
 */
function showFormQuestions() {
  const items = FormApp.getActiveForm().getItems();
  const titles = items.map(function (i) { return i.getTitle().toLowerCase().trim(); });

  const claimed = {};
  Object.keys(FIELD_MATCHERS).forEach(function (field) {
    const matchers = FIELD_MATCHERS[field];
    for (var m = 0; m < matchers.length; m++) {
      for (var t = 0; t < titles.length; t++) {
        if (titles[t].indexOf(matchers[m]) !== -1 && !claimed[titles[t]]) {
          claimed[titles[t]] = field;
          return;
        }
      }
    }
  });

  Logger.log('FORM: ' + FormApp.getActiveForm().getTitle());
  Logger.log('--------------------------------------------------');
  items.forEach(function (item, i) {
    const title = item.getTitle();
    const field = claimed[title.toLowerCase().trim()];
    Logger.log(
      (i + 1) + '. "' + title + '"  [' + item.getType() + ']' +
      '\n     -> ' + (field ? field : 'NOT MAPPED (ignored on submit)')
    );
  });
  Logger.log('--------------------------------------------------');

  const mapped = Object.keys(claimed).map(function (k) { return claimed[k]; });

  if (mapped.indexOf('existing') === -1) {
    Logger.log('MISSING: no "Which project?" dropdown found.');
    Logger.log('  Add a Dropdown question titled "Which project?" and run syncProjectList().');
    Logger.log('  Without it, every submission creates a NEW project.');
  } else {
    Logger.log('OK: dropdown found — updates will target the chosen project.');
  }
  if (mapped.indexOf('project') === -1 && mapped.indexOf('brand') === -1) {
    Logger.log('MISSING: nothing maps to a project or brand name. New projects need one.');
  }
  if (mapped.indexOf('drive_links') === -1 && mapped.indexOf('youtube_links') === -1) {
    Logger.log('NOTE: no drive/YouTube question — projects will arrive with no video links.');
  }
}

// ── Project dropdown ──────────────────────────────────────────────────────

/** Finds the dropdown/list question that names existing projects. */
function findExistingProjectItem_(form) {
  const matchers = FIELD_MATCHERS.existing;
  const items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    const title = items[i].getTitle().toLowerCase().trim();
    for (var m = 0; m < matchers.length; m++) {
      if (title.indexOf(matchers[m]) !== -1) {
        const type = items[i].getType();
        if (type === FormApp.ItemType.LIST) return items[i].asListItem();
        if (type === FormApp.ItemType.MULTIPLE_CHOICE) return items[i].asMultipleChoiceItem();
      }
    }
  }
  return null;
}

/**
 * Refreshes the dropdown with every project currently in the dashboard, and
 * remembers which label maps to which project id.
 *
 * Runs hourly, after each submission, and whenever you run it by hand.
 */
function syncProjectList() {
  assertConfigured();

  const res = UrlFetchApp.fetch(endpoint('/api/projects'), {
    method: 'get',
    headers: { 'x-intake-secret': CONFIG.SECRET },
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    Logger.log('Could not load projects (' + res.getResponseCode() + '): ' + res.getContentText());
    return;
  }

  const payload = JSON.parse(res.getContentText());
  const projects = payload.projects || [];

  const form = FormApp.getActiveForm();
  const item = findExistingProjectItem_(form);
  if (!item) {
    Logger.log('No "Which project?" dropdown in this form — nothing to sync.');
    Logger.log('Add a Dropdown question titled "Which project?" and run this again.');
    return;
  }

  // Google Forms caps a single question at 1000 choices.
  const labels = [NEW_PROJECT_OPTION];
  const map = {};
  projects.slice(0, 990).forEach(function (p) {
    labels.push(p.label);
    map[p.label] = p.id;
  });

  item.setChoiceValues(labels);
  PropertiesService.getScriptProperties().setProperty('projectMap', JSON.stringify(map));

  Logger.log('Dropdown synced: ' + projects.length + ' projects.');
  if (projects.length > 990) {
    Logger.log('WARNING: over 990 projects — the list was truncated by Google\'s limit.');
  }
}

/** Resolves a dropdown label back to the project id stored at last sync. */
function projectIdForLabel_(label) {
  if (!label || label === NEW_PROJECT_OPTION) return '';
  try {
    const raw = PropertiesService.getScriptProperties().getProperty('projectMap');
    if (!raw) return '';
    const map = JSON.parse(raw);
    return map[label] || '';
  } catch (err) {
    Logger.log('Could not read the project map: ' + err);
    return '';
  }
}

// ── Submission ────────────────────────────────────────────────────────────

/** Fires on every submission. Installed by setup(). */
function onFormSubmit(e) {
  if (!e || !e.response) {
    Logger.log('No response on the event — use testConnection() rather than running this by hand.');
    return;
  }

  const payload = buildPayload(e.response);
  const ok = send(payload);

  // A newly created project should appear in the dropdown right away.
  if (ok && !payload.project_id) {
    try {
      syncProjectList();
    } catch (err) {
      Logger.log('Post-submit sync failed (not fatal): ' + err);
    }
  }
}

/** Turns a FormResponse into the JSON the dashboard expects. */
function buildPayload(response) {
  const answers = {};

  response.getItemResponses().forEach(function (itemResponse) {
    const title = itemResponse.getItem().getTitle().toLowerCase().trim();
    const value = itemResponse.getResponse();
    answers[title] = Array.isArray(value) ? value.join('\n') : String(value == null ? '' : value);
  });

  const titles = Object.keys(answers);
  const used = {};

  function pick(field) {
    const matchers = FIELD_MATCHERS[field] || [];
    for (var m = 0; m < matchers.length; m++) {
      for (var t = 0; t < titles.length; t++) {
        if (titles[t].indexOf(matchers[m]) !== -1 && answers[titles[t]] && !used[titles[t]]) {
          used[titles[t]] = true;
          return answers[titles[t]];
        }
      }
    }
    return '';
  }

  // Resolve the dropdown first so its question can't be claimed by another field.
  const chosen = pick('existing');
  const projectId = projectIdForLabel_(chosen);

  const brand = pick('brand');
  const project = pick('project');
  const submitted = response.getTimestamp();

  // Drive and YouTube answers both become video links on the card.
  const driveLinks = pick('drive_links');
  const youtubeLinks = pick('youtube_links');

  return {
    response_id: response.getId(),
    project_id: projectId,
    // Updating an existing project without renaming it leaves this blank, which
    // the server reads as "keep the current name".
    project: project || (projectId ? '' : brand),
    brand: brand,
    date: pick('date') || Utilities.formatDate(submitted, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    category: pick('category'),
    status: pick('status'),
    description: pick('description'),
    drive_links: [driveLinks, youtubeLinks].filter(String).join('\n'),
    portfolio_links: pick('portfolio_links'),
  };
}

/** POSTs with a short retry. Returns true on success. */
function send(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-intake-secret': CONFIG.SECRET },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var lastCode = 0;
  var lastBody = '';

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = UrlFetchApp.fetch(endpoint('/api/intake'), options);
      lastCode = res.getResponseCode();
      lastBody = res.getContentText();

      if (lastCode >= 200 && lastCode < 300) {
        Logger.log('Sent "' + (payload.project || payload.brand || 'project') + '" — ' + lastBody);
        return true;
      }

      // 4xx means the payload is wrong; retrying won't help.
      if (lastCode >= 400 && lastCode < 500) break;
    } catch (err) {
      lastBody = String(err);
    }
    Utilities.sleep(attempt * 2000);
  }

  Logger.log('FAILED (' + lastCode + '): ' + lastBody);
  notifyFailure(payload, lastCode, lastBody);
  return false;
}

/** Emails the form owner when a submission couldn't be delivered. */
function notifyFailure(payload, code, body) {
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'Portfolio dashboard: submission not saved',
      body:
        'A form submission could not be sent to the dashboard.\n\n' +
        'Project: ' + (payload.project || payload.brand || '(no name)') + '\n' +
        'HTTP status: ' + code + '\n' +
        'Response: ' + body + '\n\n' +
        'The response is still in the form. Re-send it by running resendAll() ' +
        'in the Apps Script editor once the dashboard is reachable.',
    });
  } catch (err) {
    Logger.log('Could not send failure email: ' + err);
  }
}

// ── Diagnostics and recovery ──────────────────────────────────────────────

/** Verifies both endpoints and the secret. Creates one throwaway draft project. */
function testConnection() {
  assertConfigured();

  const list = UrlFetchApp.fetch(endpoint('/api/projects'), {
    method: 'get',
    headers: { 'x-intake-secret': CONFIG.SECRET },
    muteHttpExceptions: true,
  });
  Logger.log('GET /api/projects -> ' + list.getResponseCode());
  if (list.getResponseCode() === 200) {
    Logger.log('  ' + JSON.parse(list.getContentText()).count + ' projects visible.');
  } else {
    Logger.log('  ' + list.getContentText());
  }

  const post = UrlFetchApp.fetch(endpoint('/api/intake'), {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-intake-secret': CONFIG.SECRET },
    payload: JSON.stringify({
      response_id: 'apps-script-test',
      project: 'Connection test — safe to delete',
      category: 'campaigns',
      status: 'draft',
      date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    }),
    muteHttpExceptions: true,
  });
  Logger.log('POST /api/intake -> ' + post.getResponseCode());
  Logger.log('  ' + post.getContentText());

  const code = post.getResponseCode();
  if (code === 200) {
    Logger.log('');
    Logger.log('Working. Delete the draft "Connection test" project from the dashboard.');
  } else if (code === 401) {
    Logger.log('Secret rejected — CONFIG.SECRET must match INTAKE_SECRET exactly.');
  } else if (code === 503) {
    Logger.log('Server has no INTAKE_SECRET set. Add it to the environment and redeploy.');
  }
}

/**
 * Pushes every existing response to the dashboard. Safe to run repeatedly —
 * a response already sent is updated, not duplicated. Use it to backfill
 * responses collected before the trigger existed, or to recover after an outage.
 */
function resendAll() {
  assertConfigured();
  const responses = FormApp.getActiveForm().getResponses();
  Logger.log('Resending ' + responses.length + ' responses…');

  var sent = 0;
  var skipped = 0;
  responses.forEach(function (response, i) {
    const payload = buildPayload(response);
    if (!payload.project && !payload.brand && !payload.project_id) {
      Logger.log((i + 1) + '. skipped — nothing identifies a project');
      skipped++;
      return;
    }
    if (send(payload)) sent++;
    Utilities.sleep(400); // stay well under the UrlFetch quota
  });

  Logger.log('Done. ' + sent + ' sent, ' + skipped + ' skipped.');
  syncProjectList();
}
