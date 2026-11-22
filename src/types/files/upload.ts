import { z } from 'zod';

import type { FileParsingTask } from '../asyncTask';

export interface FileUploadState {
  progress: number;

  restTime: number;

  speed: number;
}

export type FileUploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error'
  | 'cancelled';

export type FileUploadSessionStatus = 'active' | 'cleaning' | 'settled' | 'released' | 'expired';

export type FileProcessStatus = 'pending' | 'chunking' | 'embedding' | 'success' | 'error';

export const UPLOAD_STATUS_SET = new Set(['uploading', 'pending', 'processing']);

export interface VoiceMessageRecording {
  codec?: string;
  durationMs: number;
  file: File;
  mimeType: string;
  waveform: number[];
}

export interface UploadFileItem {
  abortController?: AbortController;
  agentId?: string;
  audioMetadata?: {
    codec?: string;
    durationMs: number;
    mimeType: string;
  };
  base64Url?: string;
  contentHash?: string;
  dimensions?: {
    height: number;
    ratio: number;
    width: number;
  };
  error?: string;
  errorCode?: string;
  file: File;
  fileUrl?: string;
  id: string;
  knowledgeBaseId?: string;
  parentId?: string;
  previewUrl?: string;
  repastedAt?: number;
  shareId?: string;
  skipRemoveFile?: boolean;
  status: FileUploadStatus;
  tasks?: FileParsingTask;
  uploadState?: FileUploadState;
  visibility?: 'private' | 'public';
}

export const AgentShareFileProvenanceSchema = z.object({
  shareId: z.string(),
  visitorUserId: z.string()
});

export type AgentShareFileProvenance = z.infer<typeof AgentShareFileProvenanceSchema>;

export type FileAccessScope =
  | ({ type: 'agentShare' } & AgentShareFileProvenance)
  | { type: 'ordinary' };

export const ordinaryFileAccessScope = { type: 'ordinary' } as const satisfies FileAccessScope;

export const agentShareFileAccessScope = (
  provenance: AgentShareFileProvenance
): FileAccessScope => ({
  shareId: provenance.shareId,
  type: 'agentShare',
  visitorUserId: provenance.visitorUserId
});

export const stripAgentShareFileProvenance = <T>(metadata: T): T => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return metadata;

  return Object.fromEntries(
    Object.entries(metadata as Record<string, unknown>).filter(([key]) => key !== 'agentShare')
  ) as T;
};

export const getAgentShareFileProvenance = (
  metadata: unknown
): AgentShareFileProvenance | undefined => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;

  const result = AgentShareFileProvenanceSchema.safeParse(
    (metadata as { agentShare?: unknown }).agentShare
  );
  return result.success ? result.data : undefined;
};

export const FileMetadataSchema = z.object({
  agentShare: AgentShareFileProvenanceSchema.optional(),
  date: z.string(),
  dirname: z.string(),
  filename: z.string(),
  height: z.number().optional(),
  path: z.string(),
  ratio: z.number().optional(),
  width: z.number().optional()
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

export const UploadFileSchema = z.object({
  fileType: z.string(),
  hash: z.string().optional(),
  knowledgeBaseId: z.string().optional(),
  metadata: z.any().optional(),
  name: z.string(),
  size: z.number(),
  source: z.string().optional(),
  url: z.string().optional()
});

export type UploadFileParams = z.infer<typeof UploadFileSchema>;

export interface CheckFileHashResult {
  fileType?: string;
  isExist: boolean;
  metadata?: unknown;
  size?: number;
  url?: string;
}

export interface UploadBase64ToS3Result {
  fileType: string;
  hash: string;
  metadata: FileMetadata;
  size: number;
}
