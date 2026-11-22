import { relations } from 'drizzle-orm';

import { apiKeys } from './apiKey';
import { accounts, authSessions, passkey, twoFactor } from './betterAuth';
import { invoices, subscriptions, userUsageQuotas } from './billing';
import { files } from './file';
import { notificationDeliveries, notifications } from './notification';
import { rbacPermissions, rbacRolePermissions, rbacRoles, rbacUserRoles } from './rbac';
import { filesToSessions, sessions } from './session';
import { users, userSettings } from './user';
import {
  workspaceAuditLogs,
  workspaceInvitations,
  workspaceMembers,
  workspaces
} from './workspace';

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.id]
  }),
  sessions: many(sessions),
  files: many(files),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  sentInvitations: many(workspaceInvitations),
  notifications: many(notifications),
  userRoles: many(rbacUserRoles),
  apiKeys: many(apiKeys),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  usageQuotas: many(userUsageQuotas),
  authSessions: many(authSessions),
  accounts: many(accounts),
  twoFactor: one(twoFactor),
  passkeys: many(passkey)
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.id],
    references: [users.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  }),
  filesToSessions: many(filesToSessions)
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id]
  }),
  filesToSessions: many(filesToSessions)
}));

export const filesToSessionsRelations = relations(filesToSessions, ({ one }) => ({
  file: one(files, {
    fields: [filesToSessions.fileId],
    references: [files.id]
  }),
  session: one(sessions, {
    fields: [filesToSessions.sessionId],
    references: [sessions.id]
  })
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  primaryOwner: one(users, {
    fields: [workspaces.primaryOwnerId],
    references: [users.id]
  }),
  members: many(workspaceMembers),
  invitations: many(workspaceInvitations),
  auditLogs: many(workspaceAuditLogs)
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id]
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id]
  })
}));

export const workspaceInvitationsRelations = relations(workspaceInvitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceInvitations.workspaceId],
    references: [workspaces.id]
  }),
  inviter: one(users, {
    fields: [workspaceInvitations.inviterId],
    references: [users.id]
  })
}));

export const workspaceAuditLogsRelations = relations(workspaceAuditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceAuditLogs.workspaceId],
    references: [workspaces.id]
  }),
  user: one(users, {
    fields: [workspaceAuditLogs.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
  deliveries: many(notificationDeliveries)
}));

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationDeliveries.notificationId],
    references: [notifications.id]
  })
}));

export const rbacRolesRelations = relations(rbacRoles, ({ many }) => ({
  rolePermissions: many(rbacRolePermissions),
  userRoles: many(rbacUserRoles)
}));

export const rbacPermissionsRelations = relations(rbacPermissions, ({ many }) => ({
  rolePermissions: many(rbacRolePermissions)
}));

export const rbacRolePermissionsRelations = relations(rbacRolePermissions, ({ one }) => ({
  role: one(rbacRoles, {
    fields: [rbacRolePermissions.roleId],
    references: [rbacRoles.id]
  }),
  permission: one(rbacPermissions, {
    fields: [rbacRolePermissions.permissionId],
    references: [rbacPermissions.id]
  })
}));

export const rbacUserRolesRelations = relations(rbacUserRoles, ({ one }) => ({
  user: one(users, {
    fields: [rbacUserRoles.userId],
    references: [users.id]
  }),
  role: one(rbacRoles, {
    fields: [rbacUserRoles.roleId],
    references: [rbacRoles.id]
  })
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id]
  })
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  })
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id]
  })
}));

export const userUsageQuotasRelations = relations(userUsageQuotas, ({ one }) => ({
  user: one(users, {
    fields: [userUsageQuotas.userId],
    references: [users.id]
  })
}));

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, {
    fields: [authSessions.userId],
    references: [users.id]
  })
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(users, {
    fields: [twoFactor.userId],
    references: [users.id]
  })
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(users, {
    fields: [passkey.userId],
    references: [users.id]
  })
}));
