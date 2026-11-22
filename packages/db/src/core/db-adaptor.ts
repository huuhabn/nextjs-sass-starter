import type { AppDatabase } from '../type';
import { type DBConfig, getDBInstance } from './web-server';

let cachedDB: AppDatabase | null = null;

export const getServerDB = async (config?: DBConfig): Promise<AppDatabase> => {
  if (cachedDB) return cachedDB;

  try {
    cachedDB = getDBInstance(config);
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Lazy getter for serverDB so accessing it does not throw at import time
 * if DATABASE_URL is not set yet in test or build environments.
 */
export const serverDB: AppDatabase = new Proxy({} as AppDatabase, {
  get(_target, prop) {
    if (!cachedDB) {
      cachedDB = getDBInstance();
    }
    return (cachedDB as unknown as Record<string | symbol, unknown>)[prop];
  }
});
