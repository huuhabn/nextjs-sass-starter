import { boolean, index, integer, jsonb, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { accessedAt, createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const rbacPermissions = pgTable('rbac_permissions', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity({ name: 'rbac_permissions_id_seq' }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  accessedAt: accessedAt(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
});

export const rbacRoles = pgTable('rbac_roles', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity({ name: 'rbac_roles_id_seq' }),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  accessedAt: accessedAt(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  metadata: jsonb('metadata').default({})
});

export const rbacRolePermissions = pgTable(
  'rbac_role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => rbacRoles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => rbacPermissions.id, { onDelete: 'cascade' }),
    createdAt: createdAt()
  },
  (t) => [
    primaryKey({
      columns: [t.roleId, t.permissionId],
      name: 'rbac_role_permissions_role_id_permission_id_pk'
    }),
    index('rbac_role_permissions_role_id_idx').on(t.roleId),
    index('rbac_role_permissions_permission_id_idx').on(t.permissionId)
  ]
);

export const rbacUserRoles = pgTable(
  'rbac_user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => rbacRoles.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    expiresAt: timestamptz('expires_at')
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId], name: 'rbac_user_roles_user_id_role_id_pk' }),
    index('rbac_user_roles_user_id_idx').on(t.userId),
    index('rbac_user_roles_role_id_idx').on(t.roleId)
  ]
);

export const insertRbacPermissionSchema = createInsertSchema(rbacPermissions);
export const selectRbacPermissionSchema = createSelectSchema(rbacPermissions);
export type RbacPermissionItem = typeof rbacPermissions.$inferSelect;
export type NewRbacPermission = typeof rbacPermissions.$inferInsert;

export const insertRbacRoleSchema = createInsertSchema(rbacRoles);
export const selectRbacRoleSchema = createSelectSchema(rbacRoles);
export type RbacRoleItem = typeof rbacRoles.$inferSelect;
export type NewRbacRole = typeof rbacRoles.$inferInsert;

export const insertRbacRolePermissionSchema = createInsertSchema(rbacRolePermissions);
export const selectRbacRolePermissionSchema = createSelectSchema(rbacRolePermissions);
export type RbacRolePermissionItem = typeof rbacRolePermissions.$inferSelect;
export type NewRbacRolePermission = typeof rbacRolePermissions.$inferInsert;

export const insertRbacUserRoleSchema = createInsertSchema(rbacUserRoles);
export const selectRbacUserRoleSchema = createSelectSchema(rbacUserRoles);
export type RbacUserRoleItem = typeof rbacUserRoles.$inferSelect;
export type NewRbacUserRole = typeof rbacUserRoles.$inferInsert;
