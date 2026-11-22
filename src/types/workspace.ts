export type WorkspaceRole = 'owner' | 'admin' | 'member' | string;

export type WorkspaceInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | string;

export interface WorkspaceSettings {
  [key: string]: unknown;
}

export interface WorkspaceAuditLogMetadata {
  [key: string]: unknown;
}
