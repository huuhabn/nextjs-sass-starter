import type { MetaData } from '../meta';

export const CHAT_GROUP_SESSION_ID_PREFIX = 'cg_' as const;

export const isChatGroupSessionId = (id?: string | null): id is string =>
  typeof id === 'string' && id.startsWith(CHAT_GROUP_SESSION_ID_PREFIX);

export enum SessionType {
  Agent = 'agent',
  Group = 'group'
}

export interface Session {
  createdAt: Date;
  group?: string;
  id: string;
  /** Market agent identifier for published agents */
  marketIdentifier?: string;
  meta: MetaData;
  model: string;
  pinned?: boolean;
  tags?: string[];
  type: SessionType.Agent;
  updatedAt: Date;
}

export type LobeSessions = Session[];
