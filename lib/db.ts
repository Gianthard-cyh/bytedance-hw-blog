type Pool = { execute: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]> };
let pool: Pool | null = null;
async function ensurePool(): Promise<Pool> {
  if (pool) return pool;
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) throw new Error("Missing database configuration");
  const mysql: unknown = await import("mysql2/promise");
  const mod = mysql as { createPool: (config: unknown) => Pool };
  pool = mod.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return pool;
}
export async function query(sql: string, params?: unknown[]) {
  const p = await ensurePool();
  const [rows] = await p.execute(sql, params ?? []);
  return rows as unknown[];
}
export async function execute(sql: string, params?: unknown[]) {
  const p = await ensurePool();
  return p.execute(sql, params ?? []);
}
export function getNumber(param: string | null, def: number) {
  if (!param) return def;
  const n = Number(param);
  if (!Number.isFinite(n) || n <= 0) return def;
  return n;
}
export function json<T>(data: T, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}
