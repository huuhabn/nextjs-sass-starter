import * as dotenv from 'dotenv';
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator';
import { migrate as nodeMigrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDBInstance } from '../core/web-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from root or local package
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const migrationsFolder = path.resolve(__dirname, '../../migrations');

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Please configure it in .env or .env.local');
    process.exit(1);
  }

  console.log('🔄 Running database migrations on:', connectionString.replace(/:[^:@]*@/, ':****@'));
  const startTime = Date.now();

  const driver =
    (process.env.DATABASE_DRIVER as 'node' | 'neon') ??
    (connectionString.includes('neon.tech') ? 'neon' : 'node');

  const db = getDBInstance({ driver });

  if (driver === 'node') {
    await nodeMigrate(db as any, { migrationsFolder });
  } else {
    await neonMigrate(db as any, { migrationsFolder });
  }

  console.log(`✅ Migrations applied successfully in ${Date.now() - startTime}ms!`);
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
