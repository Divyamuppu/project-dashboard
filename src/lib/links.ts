import type { LinkType, ProjectCategory } from "@/types/database";

export const CATEGORY_KEYS: ProjectCategory[] = [
  "social",
  "campaigns",
  "corporate",
  "events",
  "bts",
];

export const MAX_LABEL_LENGTH = 120;
export const MAX_NAME_LENGTH = 160;
export const MAX_LINKS_PER_SUBMISSION = 50;

/**
 * Accepts what people actually paste — bare hosts, stray whitespace, a trailing
 * comma — and returns a canonical absolute URL, or null when it can't be one.
 */
export function normalizeUrl(raw: string): string | null {
  const v = String(raw ?? "")
    .trim()
    .replace(/[),.;]+$/, "");
  if (!v) return null;

  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Fallback label when the submitter didn't give one. */
export function labelFromUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com/playlist")) return "YouTube playlist";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("drive.google.com/file")) return "Drive file";
  if (u.includes("drive.google.com")) return "Drive folder";
  if (u.includes("vimeo.com")) return "Vimeo";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

/**
 * Pulls every URL out of a free-text field. Google Forms gives one string per
 * question, and people paste several links separated by commas, spaces or
 * newlines — so a single answer can legitimately carry many.
 */
export function extractUrls(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of String(raw).split(/[\s,;]+/)) {
    const url = normalizeUrl(token);
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

export type CleanLink = { id?: string; type: LinkType; label: string; url: string };

export type CleanResult =
  | { ok: true; links: CleanLink[] }
  | { ok: false; error: string };

/** Drops blank rows, validates the rest, de-duplicates by type+url. */
export function cleanLinks(links: CleanLink[]): CleanResult {
  const out: CleanLink[] = [];
  const seen = new Set<string>();

  for (const l of links ?? []) {
    const rawUrl = l?.url ?? "";
    const rawLabel = l?.label ?? "";
    if (!String(rawUrl).trim() && !String(rawLabel).trim()) continue;

    const url = normalizeUrl(rawUrl);
    if (!url) return { ok: false, error: `"${rawLabel || rawUrl}" isn't a valid URL.` };

    if (l.type !== "video" && l.type !== "portfolio")
      return { ok: false, error: "Unknown link type." };

    const label = String(rawLabel).trim() || labelFromUrl(url);
    if (label.length > MAX_LABEL_LENGTH)
      return { ok: false, error: `Link labels must be under ${MAX_LABEL_LENGTH} characters.` };

    const key = `${l.type}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ id: l.id, type: l.type, label, url });
  }

  if (out.length > MAX_LINKS_PER_SUBMISSION)
    return { ok: false, error: `Too many links (max ${MAX_LINKS_PER_SUBMISSION}).` };

  return { ok: true, links: out };
}

/**
 * Maps whatever the form's category dropdown says onto a category key.
 * Tolerant of casing, spacing and the wordings the team already uses in the
 * portfolio sheet, so the form's option labels don't have to match the enum.
 */
const CATEGORY_ALIASES: Record<string, ProjectCategory> = {
  social: "social",
  "social media": "social",
  "all things social": "social",
  reels: "social",
  campaigns: "campaigns",
  campaign: "campaigns",
  "brand campaigns": "campaigns",
  "digital films": "campaigns",
  "digital films and tvcs": "campaigns",
  tvc: "campaigns",
  tvcs: "campaigns",
  ads: "campaigns",
  corporate: "corporate",
  "corporate films": "corporate",
  "corporate film": "corporate",
  brandfilm: "corporate",
  "brand film": "corporate",
  events: "events",
  event: "events",
  "event films": "events",
  "event film": "events",
  bts: "bts",
  "behind the scenes": "bts",
  "behind-the-scenes": "bts",
};

export function parseCategory(raw: string): ProjectCategory | null {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!key) return null;
  if ((CATEGORY_KEYS as string[]).includes(key)) return key as ProjectCategory;
  return CATEGORY_ALIASES[key] ?? null;
}

/**
 * Google Forms date answers arrive as an ISO timestamp from Apps Script, but a
 * hand-typed short-answer date could be dd/mm/yyyy. Returns YYYY-MM-DD or null.
 */
export function parseDate(raw: unknown): string | null {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const dmy = v.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const day = Number(d);
    const month = Number(m);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(v);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
