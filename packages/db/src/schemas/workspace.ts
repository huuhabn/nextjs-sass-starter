import { index, jsonb, pgTable, primaryKey, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const workspaces = pgTable(
  'workspaces',
  {
    id: text('id').primaryKey().notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }),
    avatar: text('avatar'),
    primaryOwnerId: text('primary_owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    settings: jsonb('settings').default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    uniqueIndex('workspaces_slug_idx').on(t.slug),
    index('workspaces_primary_owner_id_idx').on(t.primaryOwnerId)
  ]
);

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    joinedAt: timestamptz('joined_at').defaultNow().notNull(),
    updatedAt: updatedAt(),
    deletedAt: timestamptz('deleted_at')
  },
  (t) => [
    primaryKey({
      columns: [t.workspaceId, t.userId],
      name: 'workspace_members_workspace_id_user_id_pk'
    }),
    index('workspace_members_user_id_idx').on(t.userId)
  ]
);

export const workspaceInvitations = pgTable(
  'workspace_invitations',
  {
    id: text('id').primaryKey().notNull(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    email: text('email'),
    role: text('role').default('member').notNull(),
    token: text('token').notNull().unique(),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamptz('expires_at').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('workspace_invitations_workspace_id_idx').on(t.workspaceId),
    index('workspace_invitations_email_idx').on(t.email),
    index('workspace_invitations_token_idx').on(t.token)
  ]
);

export const workspaceAuditLogs = pgTable(
  'workspace_audit_logs',
  {
    id: text('id').primaryKey().notNull(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id'),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: text('resource_id'),
    metadata: jsonb('metadata').default({}),
    ipAddress: text('ip_address'),
    createdAt: createdAt()
  },
  (t) => [
    index('workspace_audit_logs_workspace_id_idx').on(t.workspaceId),
    index('workspace_audit_logs_action_idx').on(t.action),
    index('workspace_audit_logs_created_at_idx').on(t.createdAt)
  ]
);

export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export type WorkspaceItem = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers);
export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMembers);
export type WorkspaceMemberItem = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;

export const insertWorkspaceInvitationSchema = createInsertSchema(workspaceInvitations);
export const selectWorkspaceInvitationSchema = createSelectSchema(workspaceInvitations);
export type WorkspaceInvitationItem = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;

export const insertWorkspaceAuditLogSchema = createInsertSchema(workspaceAuditLogs);
export const selectWorkspaceAuditLogSchema = createSelectSchema(workspaceAuditLogs);
export type WorkspaceAuditLogItem = typeof workspaceAuditLogs.$inferSelect;
export type NewWorkspaceAuditLog = typeof workspaceAuditLogs.$inferInsert;
