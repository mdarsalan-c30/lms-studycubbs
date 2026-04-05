import mysql from 'mysql2/promise';

// Environment-aware connection configuration
const connectionString = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/studycubs_lms';

console.log(`[Database] Initializing pool for: ${connectionString.split('@')[1]}`);

const poolWithGlobal = global as typeof globalThis & {
  pool: mysql.Pool | undefined;
};

// Singleton pattern to prevent connection leaks during hot-reloading
export const pool = poolWithGlobal.pool || mysql.createPool({
  uri: connectionString,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

if (process.env.NODE_ENV !== 'production') {
  poolWithGlobal.pool = pool;
}

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  console.log(`[DB Query] SQL: ${sql}`, params || []);
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('[DB Query Error]', error);
    throw error;
  }
}

export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export const db = {
  query,
  queryOne,
  execute: async (sql: string, params?: any[]) => {
    console.log(`[DB Execute] SQL: ${sql}`, params || []);
    try {
      const [result]: any = await pool.execute(sql, params);
      console.log(`[DB Execute Success] Rows affected: ${result.affectedRows}`);
      return result;
    } catch (error) {
      console.error('[DB Execute Error]', error);
      throw error;
    }
  },
  pool
};

export default db;
