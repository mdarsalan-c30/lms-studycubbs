import mysql from 'mysql2/promise';
import { dbConfig } from './config';

// Individual field connection configuration
console.log(`[Database] Initializing pool for host: ${dbConfig.host}`);

const poolWithGlobal = global as typeof globalThis & {
  pool: mysql.Pool | undefined;
};

// Singleton pattern using individual fields
export const pool = poolWithGlobal.pool || mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
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
