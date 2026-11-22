import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { getTestDB } from '../src/core/getTestDB';

describe('Database Migrations', () => {
  it('should successfully run 2 migrations (base + saas) and create all 19 tables', async () => {
    const db = await getTestDB();

    // Query information_schema for public tables
    const result = await db.execute<{ table_name: string }>(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = (result.rows as any[]).map((r) => r.table_name);

    const expectedTables = [
      // Base tables (0000_base_tables.sql)
      'users',
      'user_settings',
      'sessions',
      'files',
      'files_to_sessions',
      'api_keys',
      // SaaS extension tables (0001_saas_extensions.sql)
      'workspaces',
      'workspace_members',
      'workspace_invitations',
      'workspace_audit_logs',
      'notifications',
      'notification_deliveries',
      'rbac_roles',
      'rbac_permissions',
      'rbac_role_permissions',
      'rbac_user_roles',
      'subscriptions',
      'invoices',
      'user_usage_quotas'
    ];

    for (const expected of expectedTables) {
      expect(tableNames).toContain(expected);
    }

    expect(expectedTables.length).toBe(19);
  });
});
