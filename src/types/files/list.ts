import { z } from 'zod';

import type { AsyncTaskStatus, FileParsingTask } from '../asyncTask';

export interface KnowledgeItemStatus extends FileParsingTask {
  id: string;
}

export interface FileUploader {
  avatar?: string | null;
  fullName?: string | null;
  id: string;
  username?: string | null;
}

export interface FileListItem {
  chunkCount: number | null;
  chunkingError: any | null;
  chunkingStatus?: AsyncTaskStatus | null;
  content?: string | null;
  contentPreview?: string | null;
  createdAt: Date;
  editorData?: Record<string, any> | null;
  embeddingError: any | null;
  embeddingStatus?: AsyncTaskStatus | null;
  fileId?: string | null;
  fileType: string;
  finishEmbedding: boolean;
  hasChildren?: boolean;
  id: string;
  knowledgeBaseIds?: string[];
  metadata?: Record<string, any> | null;
  name: string;
  parentId?: string | null;
  size: number;
  slug?: string | null;
  sourceType: string;
  updatedAt: Date;
  uploader?: FileUploader | null;
  url: string;
  userId?: string | null;
  visibility?: 'private' | 'public' | null;
}

export type ResourceSorter = 'custom' | 'name' | 'createdAt' | 'size';

export enum SortType {
  Asc = 'asc',
  Desc = 'desc'
}

export enum ResourceSourceFilter {
  Acceptance = 'acceptance',
  All = 'all',
  Generated = 'generated',
  Uploaded = 'uploaded'
}

const MAX_RESOURCE_LIST_PAGE_SIZE = 100;

export const QueryFileListSchema = z.object({
  category: z.string().optional(),
  filesOnly: z.boolean().optional(),
  includeContentPreview: z.boolean().optional(),
  knowledgeBaseId: z.string().optional(),
  limit: z.number().int().positive().max(MAX_RESOURCE_LIST_PAGE_SIZE).default(50),
  offset: z.number().int().min(0).default(0),
  parentId: z.string().nullish(),
  q: z.string().nullish(),
  showFilesInKnowledgeBase: z.boolean().default(false),
  sortType: z.enum(['desc', 'asc']).optional(),
  sorter: z.enum(['custom', 'name', 'createdAt', 'size', 'updatedAt']).optional(),
  sourceFilter: z.nativeEnum(ResourceSourceFilter).optional(),
  visibility: z.enum(['private', 'public']).optional()
});

export type QueryFileListSchemaType = z.infer<typeof QueryFileListSchema>;

export interface QueryFileListParams {
  category?: string;
  filesOnly?: boolean;
  includeContentPreview?: boolean;
  knowledgeBaseId?: string;
  limit?: number;
  offset?: number;
  parentId?: string | null;
  q?: string | null;
  showFilesInKnowledgeBase?: boolean;
  sorter?: string;
  sortType?: string;
  sourceFilter?: ResourceSourceFilter;
  visibility?: 'private' | 'public';
}

export interface PaginatedFileList {
  hasMore: boolean;
  items: FileListItem[];
  total?: number;
}
