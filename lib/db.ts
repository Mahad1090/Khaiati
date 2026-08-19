import "server-only";
import { Pool, type QueryResultRow } from "pg";

// Server-only Postgres pool. Never import this from a client component —
// the `server-only` guard above throws a build error if that happens.
//
// The pool is created lazily (on first query) rather than at module load,
// so pages can still be statically analyzed / built before DATABASE_URL is
// configured; the friendly "not connected" error only surfaces at request time.

declare global {
  // eslint-disable-next-line no-var
  var __khaiatiPgPool: Pool | undefined;
}

function getPool(): Pool {
  if (global.__khaiatiPgPool) return global.__khaiatiPgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at your PostgreSQL instance."
    );
  }
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  global.__khaiatiPgPool = pool;
  return pool;
}

/** Parameterized query helper. Always pass values via `params`, never interpolate. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return getPool().query<T>(text, params);
}

/** Run a set of queries inside a single transaction (for multi-table financial/stock updates). */
export async function withTransaction<T>(
  fn: (client: { query: typeof query }) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const scoped = {
      query: <U extends QueryResultRow = QueryResultRow>(
        text: string,
        params: unknown[] = []
      ) => client.query<U>(text, params),
    };
    const result = await fn(scoped);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Sets the Postgres session variable Row Level Security policies read
 * (see db/migrations/0012_rls_policies.sql) and runs one query on that same
 * connection. This is the RLS-aware counterpart to query() — plain query()
 * never sets app.current_business_id, so it relies entirely on the
 * application-layer WHERE clauses already in lib/actions/*.ts.
 *
 * NOT YET adopted by the existing action files (that's a separate, larger
 * migration of every call site) — this exists so RLS has a real, working
 * activation path today rather than being unusable infrastructure. New
 * code, or code being hardened, should prefer this over query().
 */
export async function queryScoped<T extends QueryResultRow = QueryResultRow>(
  businessId: string,
  text: string,
  params: unknown[] = []
) {
  const client = await getPool().connect();
  try {
    await client.query("select set_config('app.current_business_id', $1, false)", [businessId]);
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

/** Transactional counterpart to queryScoped — sets the RLS session variable once, then runs every query in fn on the same connection/transaction. */
export async function withTenantTransaction<T>(
  businessId: string,
  fn: (client: { query: typeof query }) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.current_business_id', $1, true)", [businessId]);
    const scoped = {
      query: <U extends QueryResultRow = QueryResultRow>(
        text: string,
        params: unknown[] = []
      ) => client.query<U>(text, params),
    };
    const result = await fn(scoped);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
