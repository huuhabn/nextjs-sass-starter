import type { PgDatabase } from 'drizzle-orm/pg-core';

import type * as schema from './schemas';

export type AppDatabaseSchema = typeof schema;
export type DatabaseSchema = AppDatabaseSchema;

export type AppDatabase = PgDatabase<any, AppDatabaseSchema>;
export type Database = AppDatabase;

export type Transaction = Parameters<Parameters<AppDatabase['transaction']>[0]>[0];
