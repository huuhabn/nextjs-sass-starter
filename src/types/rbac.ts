export interface RbacRoleMetadata {
  [key: string]: unknown;
}

export type RbacCategory = 'system' | 'workspace' | 'content' | string;
