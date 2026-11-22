import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from 'ws';

import * as schema from '../schemas';
import type { AppDatabase } from '../type';

const DEFAULT_POOL_ACQUIRE_TIMEOUT_MS = 30_000;

export interface PoolOptionsConfig {
  DATABASE_POOL_ACQUIRE_TIMEOUT?: number;
  DATABASE_STATEMENT_TIMEOUT?: number;
}

export const buildPoolOptions = (env: PoolOptionsConfig = {}) => {
  const statementTimeout = env.DATABASE_STATEMENT_TIMEOUT;

  return {
    connectionTimeoutMillis: env.DATABASE_POOL_ACQUIRE_TIMEOUT ?? DEFAULT_POOL_ACQUIRE_TIMEOUT_MS,
    ...(statementTimeout
      ? {
          idle_in_transaction_session_timeout: statementTimeout,
          statement_timeout: statementTimeout
        }
      : {})
  };
};

export interface DBConfig {
  connectionString?: string;
  driver?: 'node' | 'neon';
  poolOptions?: PoolOptionsConfig;
}

export const getDBInstance = (config?: DBConfig): AppDatabase => {
  const connectionString = config?.connectionString ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Please provide a valid database connection string in your environment.'
    );
  }

  const poolOptions = buildPoolOptions(config?.poolOptions);
  const driver =
    config?.driver ??
    (process.env.DATABASE_DRIVER as 'node' | 'neon') ??
    (connectionString.includes('neon.tech') ? 'neon' : 'node');

  if (driver === 'node') {
    const client = new NodePool({ connectionString, ...poolOptions });
    client.on('error', (err) => {
      console.error('[NodePool] idle client error:', {
        code: (err as NodeJS.ErrnoException).code,
        message: err.message
      });
    });
    return nodeDrizzle(client, { schema }) as AppDatabase;
  }

  // Neon serverless driver
  if (typeof WebSocket === 'undefined') {
    neonConfig.webSocketConstructor = ws;
  }

  const client = new NeonPool({ connectionString, ...poolOptions });
  client.on('error', (err: Error) => {
    console.error('[NeonPool] idle client error:', {
      message: err.message
    });
  });

  return neonDrizzle(client, { schema }) as AppDatabase;
};
