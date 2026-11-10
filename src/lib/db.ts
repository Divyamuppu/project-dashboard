import { neon, neonConfig } from "@neondatabase/serverless";

/**
 * Neon database access.
 *
 * Everything goes through `query(text, params)`. That shape is supported by
 * Neon's serverless driver and by plain `pg`, which means the exact SQL this
 * app runs in production can be executed against an ordinary Postgres in
 * tests — no second code path to drift out of sync.
 *
 * DATABASE_URL comes from the Neon dashboard. Use the **pooled** connection
 * string (the host contains `-pooler`) so concurrent serverless invocations
 * don't exhaust Postgres connections.
 */

// Reuse the fetch connection across invocations where the process is warm.
neonConfig.fetchConnectionCache = true;

let client: ReturnType<typeof neon> | null = null;

function getClient() {
  if (client) return client;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy the pooled connection string from your " +
        "Neon dashboard (Connection Details → Pooled connection)."
    );
  }

  client = neon(url);
  return client;
}

/**
 * Runs one statement. Values are sent as bind parameters, never concatenated,
 * so this is safe against injection by construction.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const rows = await getClient().query(text, params);
  return rows as T[];
}

/** First row, or null. Convenience for lookups that return at most one row. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length ? rows[0]! : null;
}

/**
 * Runs several statements as one atomic unit.
 *
 * Neon's HTTP driver executes a transaction as a single batched request, so
 * the statements must all be known up front — it can't branch on an earlier
 * result mid-transaction. Where a write genuinely needs that (reading an id
 * back before inserting children), the code does the read first and then
 * sends one transaction, which is the pattern used throughout the actions.
 */
export async function transaction<T = Record<string, unknown>>(
  statements: Array<{ text: string; params?: unknown[] }>
): Promise<T[][]> {
  const sql = getClient();
  const batched = statements.map((s) => sql.query(s.text, s.params ?? []));
  const results = await sql.transaction(batched);
  return results as T[][];
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
