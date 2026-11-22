import { customAlphabet } from 'nanoid';

export const createNanoId = (size = 8) =>
  customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', size);

const prefixes = {
  user: 'usr',
  workspace: 'ws',
  workspaceInvitations: 'wsi',
  workspaceAuditLogs: 'wal',
  sessions: 'ssn',
  files: 'file',
  apiKeys: 'key',
  subscription: 'sub',
  invoice: 'inv',
  quota: 'qta'
} as const;

export const idGenerator = (namespace: keyof typeof prefixes, size = 12) => {
  const hash = createNanoId(size);
  const prefix = prefixes[namespace];

  if (!prefix) throw new Error(`Invalid namespace: ${namespace}`);

  return `${prefix}_${hash()}`;
};

export const randomSlug = (prefix = 'item', size = 6) => {
  const hash = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', size);
  return `${prefix}-${hash()}`;
};

export const inboxSessionId = (userId: string) => `ssn_inbox_${userId}`;
