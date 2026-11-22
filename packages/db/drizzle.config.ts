import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from root or local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  }
});
