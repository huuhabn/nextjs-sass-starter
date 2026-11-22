export interface CreateApiKeyParams {
  expiresAt?: Date | null;
  name: string;
  scopes?: string[] | null;
}

export interface UpdateApiKeyParams {
  enabled?: boolean;
  expiresAt?: Date | null;
  name?: string;
  scopes?: string[] | null;
}

export type WorkspaceApiKeyMemberCreation = 'admins_only' | 'all_members';

export type WorkspaceConnectorMemberManage = 'admins_only' | 'all_members';

export const CONNECTOR_VISIBILITIES = ['private', 'public'] as const;
export type ConnectorVisibility = (typeof CONNECTOR_VISIBILITIES)[number];
