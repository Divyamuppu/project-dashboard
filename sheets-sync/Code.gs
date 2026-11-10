/**
 * a-tom Portfolio — Google Sheet → Dashboard sync
 *
 * Paste into the SHEET's Apps Script editor (Extensions → Apps Script),
 * fill in CONFIG, then run setup() once.
 *
 * The sheet is the source of truth: edit a row and the dashboard follows.
 * Renaming works, because the first sync writes each project's dashboard id
 * into a "Dashboard ID" column and later syncs go by that id, not by name.
 *
 * Layout is detected automatically — any tab, any header row in the first few
 * rows, columns found by name. Run checkSetup() to see exactly what it found.
 *
 * Instructions: sheets-sync/README.md
 */

const CONFIG = {
  // Your deployed app, no trailing slash, no /api.
  // e.g. https://project-dashboard-s2di.onrender.com
  BASE_URL: 'PASTE_YOUR_APP_URL_HERE',

  // Must match the INTAKE_SECRET environment variable on the server, exactly.
  SECRET: 'PASTE_YOUR_SECRET_HERE',

  // How often the sheet is pushed, in minutes (1, 5, 10, 15 or 30).
  SYNC_EVERY_MINUTES: 15,

  // Category for rows where none can be worked out.
  DEFAULT_CATEGORY: 'campaigns',

  // Leave empty when this script lives inside the spreadsheet
  // (Extensions → Apps Script). If you're running it as a standalone project
  // from script.google.com, paste the sheet's id here — the long code in its
  // URL between /d/ and /edit.
  SHEET_ID: '',
};

/** Column the script writes back. Created automatically if absent. */
const ID_HEADER = 'Dashboard ID';

/** How many rows to search for the header row. */
const HEADER_SEARCH_ROWS = 6;

/**
 * Column detection. A column matches if its header contains any of these
 * (case-insensitive). Listed in priority order — the first unclaimed match wins.
 */
const COLUMN_MATCHERS = {
  dashboardId: ['dashboard id'],
  date:        ['date'],
  project:     ['project name', 'project title', 'campaign name', 'project'],
  brand:       ['brand name', 'brand', 'client'],
  category:    ['category', 'vertical', 'playlist', 'type of work'],
  status:      ['status'],
  description: ['description', 'notes', 'about'],
  drive:       ['drive link', 'drive', 'footage', 'raw'],
  youtube:     ['youtube link', 'youtube', 'yt link', 'vimeo', 'video'],
  portfolio:   ['portfolio link', 'portfolio', 'behance', 'case study'],
  index:       ['no.', 's.no', 'sr no', 'serial'],
};

/** Sheet wording → dashboard category. Extend freely. */
const CATEGORY_ALIASES = {
  'social': 'social',
  'all things social': 'social',
  'podcasts': 'social',
  'retainers': 'social',
  'internal marketing': 'social',
  'campaigns': 'campaigns',
  'campaign': 'campaigns',
  'brand campaigns': 'campaigns',
  'zomato': 'campaigns',
  'entertainment': 'campaigns',
  'digital films and tvcs': 'campaigns',
  'f&b, fmcg': 'campaigns',
  'fashion and retail': 'campaigns',
  'corporate': 'corporate',
  'corporate films': 'corporate',
  'corporate film': 'corporate',
  'events': 'events',
  'event': 'events',
  'event films': 'events',
  'bts': 'bts',
  'behind the scenes': 'bts',
};

function endpoint(path) {
  return String(CONFIG.BASE_URL).replace(/\/+$/, '') + path;
}

/**
 * The spreadsheet to sync.
 *
 * Bound scripts get it from the active spreadsheet; a standalone script needs
 * CONFIG.SHEET_ID. Fails with an explanation rather than a null reference.
 */
function getSpreadsheet_() {
  if (CONFIG.SHEET_ID && CONFIG.SHEET_ID.indexOf('PASTE_') !== 0) {
    return SpreadsheetApp.openById(CONFIG.SHEET_ID);
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    'No spreadsheet found. Either open this script from the sheet ' +
    '(Extensions -> Apps Script), or set CONFIG.SHEET_ID to the sheet id ' +
    'from its URL (the part between /d/ and /edit).'
  );
}

function assertConfigured() {
  if (CONFIG.BASE_URL.indexOf('PASTE_') === 0 || CONFIG.SECRET.indexOf('PASTE_') === 0) {
    throw new Error('Fill in BASE_URL and SECRET in CONFIG first.');
  }
}

// ── Menu ──────────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Dashboard')
    .addItem('Sync now', 'syncNow')
    .addItem('Sync everything (ignore cache)', 'syncAll')
    .addSeparator()
    .addItem('Check setup', 'checkSetup')
    .addToUi();
}

// ── Setup ─────────────────────────────────────────────────────────────────

/** Run once from the editor. Installs the timer and does a first full sync. */
function setup() {
  assertConfigured();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncNow') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('syncNow')
    .timeBased()
    .everyMinutes(CONFIG.SYNC_EVERY_MINUTES)
    .create();

  Logger.log('Timer installed: every ' + CONFIG.SYNC_EVERY_MINUTES + ' minutes.');
  Logger.log('Posting to: ' + endpoint('/api/intake'));
  Logger.log('');
  syncAll();
}

/** Shows what the script can see in each tab. Sends nothing. */
function checkSetup() {
  const lines = [];
  lines.push('App URL: ' + (CONFIG.BASE_URL.indexOf('PASTE_') === 0 ? 'NOT SET' : CONFIG.BASE_URL));
  lines.push('Secret:  ' + (CONFIG.SECRET.indexOf('PASTE_') === 0 ? 'NOT SET' : 'set'));
  lines.push('');

  getSpreadsheet_().getSheets().forEach(function (sheet) {
    const layout = detectLayout_(sheet);
    lines.push('TAB: ' + sheet.getName());

    if (!layout) {
      lines.push('   no header row found in the first ' + HEADER_SEARCH_ROWS + ' rows — skipped');
      lines.push('   (needs a row with headers like Project name / Brand name / Drive links)');
      lines.push('');
      return;
    }

    lines.push('   header row: ' + layout.headerRow);
    const cols = layout.cols;
    Object.keys(COLUMN_MATCHERS).forEach(function (k) {
      if (cols[k]) lines.push('   ' + k + ' -> column ' + columnLetter_(cols[k]) + ' ("' + layout.headers[cols[k] - 1] + '")');
    });
    if (!cols.dashboardId) lines.push('   dashboardId -> will be added on first sync');
    if (!cols.category) {
      lines.push('   category -> NO COLUMN: everything falls back to "' + CONFIG.DEFAULT_CATEGORY + '"');
      lines.push('      add a "Category" column with Social / Campaigns / Corporate Films / Event Films / BTS');
    }

    const rows = parseSheet_(sheet, layout);
    lines.push('   rows the script can see: ' + rows.length);
    rows.slice(0, 3).forEach(function (r) {
      lines.push('      row ' + r.row + ': "' + r.name + '"' +
        (r.client ? ' (brand: ' + r.client + ')' : '') +
        ' -> ' + r.category +
        ' · ' + (r.links.length + r.portfolio.length) + ' link(s)' +
        (r.date ? ' · ' + r.date : ''));
    });
    if (rows.length > 3) lines.push('      …and ' + (rows.length - 3) + ' more');
    lines.push('');
  });

  const text = lines.join('\n');
  Logger.log(text);
  try {
    SpreadsheetApp.getUi().alert('Dashboard sync — setup check', text, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) { /* no UI when run from a trigger */ }
  return text;
}

function columnLetter_(n) {
  var s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

// ── Layout detection ──────────────────────────────────────────────────────

function normHeader_(v) {
  return String(v == null ? '' : v).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Finds the header row and maps columns, for whatever shape the tab is.
 * Returns null when no row in the first few looks like headers.
 */
function detectLayout_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return null;

  const scanRows = Math.min(HEADER_SEARCH_ROWS, lastRow);
  const grid = sheet.getRange(1, 1, scanRows, lastCol).getValues();

  var best = null;

  for (var r = 0; r < scanRows; r++) {
    const headers = grid[r].map(normHeader_);
    const cols = {};
    const claimed = {};

    // Each field takes the first unclaimed column whose header matches.
    Object.keys(COLUMN_MATCHERS).forEach(function (field) {
      const matchers = COLUMN_MATCHERS[field];
      for (var m = 0; m < matchers.length; m++) {
        for (var c = 0; c < headers.length; c++) {
          if (!headers[c] || claimed[c]) continue;
          if (headers[c].indexOf(matchers[m]) !== -1) {
            cols[field] = c + 1;
            claimed[c] = true;
            return;
          }
        }
      }
    });

    // A header row needs a name source and at least one other known column.
    const hasName = cols.project || cols.brand;
    const score = Object.keys(cols).length;
    if (hasName && score >= 2 && (!best || score > best.score)) {
      best = {
        headerRow: r + 1,
        headers: grid[r].map(function (v) { return String(v == null ? '' : v).trim(); }),
        cols: cols,
        score: score,
      };
    }
  }

  return best;
}

function isUrl_(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v.trim());
}

function urlsIn_(v) {
  if (!v) return [];
  return String(v).split(/[\s,;]+/).filter(isUrl_);
}

function categoryFor_(raw) {
  const key = normHeader_(raw);
  if (!key) return '';
  return CATEGORY_ALIASES[key] || '';
}

/** Ensures the Dashboard ID column exists; returns its 1-based index. */
function ensureIdColumn_(sheet, layout) {
  if (layout.cols.dashboardId) return layout.cols.dashboardId;

  const col = sheet.getLastColumn() + 1;
  sheet.getRange(layout.headerRow, col).setValue(ID_HEADER).setFontWeight('bold');
  sheet.setColumnWidth(col, 220);
  layout.cols.dashboardId = col;
  layout.headers[col - 1] = ID_HEADER;
  return col;
}

/**
 * Reads one tab into project rows.
 *
 * Copes with the shapes this workbook uses: a Category/Playlist cell on its own
 * starts a grouping that later rows inherit, a bare name with no links is a
 * section header, and a row holding only URLs is an extra link for the row above.
 */
function parseSheet_(sheet, layout) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= layout.headerRow) return [];

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const values = sheet
    .getRange(layout.headerRow + 1, 1, lastRow - layout.headerRow, lastCol)
    .getValues();

  const c = layout.cols;
  const out = [];
  var group = '';
  var current = null;

  for (var r = 0; r < values.length; r++) {
    const row = values[r];
    const rowNumber = layout.headerRow + 1 + r;
    const at = function (col) { return col ? row[col - 1] : ''; };
    const txt = function (col) { return String(at(col) == null ? '' : at(col)).trim(); };

    const projectName = txt(c.project);
    const brandName = txt(c.brand);
    const categoryCell = txt(c.category);

    const links = urlsIn_(at(c.drive)).concat(urlsIn_(at(c.youtube)));
    const portfolio = urlsIn_(at(c.portfolio));

    // A lone category/playlist cell starts a grouping later rows inherit.
    if (categoryCell && !projectName && !brandName && links.length === 0) {
      group = categoryCell;
      current = null;
      continue;
    }

    // A bare name with no links and no row number is a section header.
    const indexCell = c.index ? txt(c.index) : null;
    if (!projectName && brandName && links.length === 0 && portfolio.length === 0 &&
        c.index && !indexCell) {
      group = brandName;
      current = null;
      continue;
    }

    // A row with only URLs belongs to the row above it.
    if (!projectName && !brandName && (links.length || portfolio.length)) {
      if (current) {
        current.links = current.links.concat(links);
        current.portfolio = current.portfolio.concat(portfolio);
      }
      continue;
    }

    // The card's title: Project name when there is one, else the brand.
    const name = projectName || brandName;
    if (!name) { current = null; continue; }

    // A brand cell that names a vertical ("social", "BTS") is the category,
    // not a client — common when the sheet has no Category column.
    const brandIsCategory = !categoryCell && !!categoryFor_(brandName);

    // Brand becomes the client only when it isn't the title or the category.
    const client = (projectName && brandName && !brandIsCategory) ? brandName : '';

    var date = '';
    if (c.date) {
      const raw = at(c.date);
      const looksLikeDate = raw && typeof raw === 'object' && typeof raw.getTime === 'function';
      if (looksLikeDate) {
        date = Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (raw) {
        date = String(raw).trim();
      }
    }

    const category =
      categoryFor_(categoryCell) ||
      categoryFor_(group) ||
      categoryFor_(brandName) ||   // some sheets put the vertical in the brand column
      CONFIG.DEFAULT_CATEGORY;

    current = {
      // Stable across tab renames; the name is kept only for messages.
      sheetId: sheet.getSheetId(),
      sheet: sheet.getName(),
      row: rowNumber,
      idCell: c.dashboardId ? { row: rowNumber, col: c.dashboardId } : null,
      existingId: c.dashboardId ? txt(c.dashboardId) : '',
      name: name,
      client: client,
      category: category,
      date: date,
      status: c.status ? txt(c.status) : '',
      description: c.description ? txt(c.description) : '',
      links: links,
      portfolio: portfolio,
    };
    out.push(current);
  }

  return out;
}

// ── Sync ──────────────────────────────────────────────────────────────────

/** Pushes rows that changed since the last run. Installed on a timer. */
function syncNow() {
  return runSync_(false);
}

/** Pushes every row, ignoring the change cache. */
function syncAll() {
  return runSync_(true);
}

function fingerprint_(entry) {
  return [
    entry.name, entry.client, entry.category, entry.date,
    entry.status, entry.description,
    entry.links.join('|'), entry.portfolio.join('|'),
  ].join('~');
}

function runSync_(force) {
  assertConfigured();

  const ss = getSpreadsheet_();
  const props = PropertiesService.getScriptProperties();
  var cache = {};
  try { cache = JSON.parse(props.getProperty('rowCache') || '{}'); } catch (e) { cache = {}; }

  var created = 0, updated = 0, skipped = 0, failed = 0, tabsSkipped = 0;
  const problems = [];

  ss.getSheets().forEach(function (sheet) {
    const layout = detectLayout_(sheet);
    if (!layout) {
      tabsSkipped++;
      Logger.log('Tab "' + sheet.getName() + '" has no recognisable header row — skipped.');
      return;
    }

    ensureIdColumn_(sheet, layout);
    const entries = parseSheet_(sheet, layout);

    entries.forEach(function (entry) {
      const key = entry.sheetId + '!' + entry.row;
      const print = fingerprint_(entry);

      if (!force && cache[key] === print && entry.existingId) {
        skipped++;
        return;
      }

      const storedId = entry.existingId && entry.existingId.indexOf('ERROR') !== 0
        ? entry.existingId : '';

      const payload = {
        project_id: storedId,
        project: entry.name,
        brand: entry.client,
        category: entry.category,
        date: entry.date,
        status: entry.status,
        description: entry.description,
        drive_links: entry.links.join('\n'),
        portfolio_links: entry.portfolio.join('\n'),
        // Keyed on the sheet's internal id, not its name, so renaming a tab
        // doesn't orphan rows that haven't been given a Dashboard ID yet.
        response_id: 'sheet:' + entry.sheetId + ':' + entry.row,
      };

      const result = post_(payload);

      if (result.ok) {
        if (entry.idCell && result.body.project_id) {
          sheet.getRange(entry.idCell.row, entry.idCell.col).setValue(result.body.project_id);
        }
        cache[key] = print;
        if (result.body.created) created++; else updated++;
      } else {
        failed++;
        problems.push(entry.sheet + ' row ' + entry.row + ' (' + entry.name + '): ' + result.message);
        if (entry.idCell && !storedId) {
          sheet.getRange(entry.idCell.row, entry.idCell.col).setValue('ERROR: ' + result.message);
        }
        delete cache[key];
      }

      Utilities.sleep(150); // stay inside the UrlFetch quota
    });
  });

  props.setProperty('rowCache', JSON.stringify(cache));

  var summary = created + ' created, ' + updated + ' updated, ' +
                skipped + ' unchanged, ' + failed + ' failed';
  if (tabsSkipped) summary += ' (' + tabsSkipped + ' tab(s) skipped)';

  Logger.log(summary);
  problems.forEach(function (p) { Logger.log('  ' + p); });

  try {
    ss.toast(summary, 'Dashboard sync', 8);
  } catch (e) { /* no UI on a timer run */ }

  return summary;
}

/** POSTs one row, with a short retry on server-side failures. */
function post_(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-intake-secret': CONFIG.SECRET },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var code = 0, text = '';

  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = UrlFetchApp.fetch(endpoint('/api/intake'), options);
      code = res.getResponseCode();
      text = res.getContentText();

      if (code >= 200 && code < 300) return { ok: true, body: JSON.parse(text) };
      if (code >= 400 && code < 500) break;   // the row itself is wrong
    } catch (err) {
      text = String(err);
    }
    Utilities.sleep(attempt * 1500);
  }

  var message = 'HTTP ' + code;
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.error) message = parsed.error;
  } catch (e) {
    if (text) message = String(text).slice(0, 120);
  }
  return { ok: false, message: message };
}
