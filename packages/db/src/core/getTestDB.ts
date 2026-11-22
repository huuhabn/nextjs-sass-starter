import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as schema from '../schemas';
import type { AppDatabase } from '../type';

let testDBInstance: AppDatabase | null = null;

export const getTestDB = async (): Promise<AppDatabase> => {
  if (testDBInstance) return testDBInstance;

  const pglite = new PGlite();

  // Find migrations directory relative to this file
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.resolve(currentDir, '../../migrations');

  const migrationFiles = ['0000_base_tables.sql', '0001_saas_extensions.sql'];

  for (const file of migrationFiles) {
    const fullPath = path.join(migrationsDir, file);
    if (fs.existsSync(fullPath)) {
      const sqlContent = fs.readFileSync(fullPath, 'utf8');
      const statements = sqlContent.split('--> statement-breakpoint');
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          await pglite.exec(trimmed);
        }
      }
    }
  }

  testDBInstance = drizzle({ client: pglite, schema }) as unknown as AppDatabase;
  return testDBInstance;
};
