export enum AsyncTaskType {
  Chunking = 'chunk',
  DataExport = 'data_export',
  Embedding = 'embedding',
  ImageGeneration = 'image_generation',
  LinearIssueSync = 'linear_issue_sync',
  MusicGeneration = 'music_generation',
  UserMemoryExtractionHourly = 'user_memory_extraction:hourly',
  UserMemoryExtractionWithChatTopic = 'user_memory_extraction:chat_topic',
  VideoGeneration = 'video_generation'
}

export enum AsyncTaskStatus {
  Error = 'error',
  Pending = 'pending',
  Processing = 'processing',
  Success = 'success'
}

export enum AsyncTaskErrorType {
  EmbeddingError = 'EmbeddingError',
  EmbeddingQuotaExceeded = 'EmbeddingQuotaExceeded',
  FileTooLargeToParse = 'FileTooLargeToParse',
  FreePlanLimit = 'FreePlanLimit',
  InvalidProviderAPIKey = 'InvalidProviderAPIKey',
  ModelNotFound = 'ModelNotFound',
  NoChunkError = 'NoChunkError',
  ProviderContentModeration = 'ProviderContentModeration',
  ServerError = 'ServerError',
  SubscriptionPlanLimit = 'SubscriptionPlanLimit',
  TaskCancelled = 'TaskCancelled',
  TaskTriggerError = 'TaskTriggerError',
  Timeout = 'TaskTimeout',
  WorkspaceFrozenByAdmin = 'WorkspaceFrozenByAdmin',
  WorkspaceFrozenByRiskControl = 'WorkspaceFrozenByRiskControl'
}

export interface AsyncTaskStructuredErrorItem {
  cause?: AsyncTaskStructuredErrorItem;
  code?: string;
  layer?: string;
  memoryIndex?: number;
  message: string;
  name?: string;
  preview?: string;
  sourceId?: string;
  sourceType?: string;
  stack?: string;
  stage?: string;
}

export interface AsyncTaskErrorBody {
  detail: string;
  extractErrors?: AsyncTaskStructuredErrorItem[];
  persistErrors?: AsyncTaskStructuredErrorItem[];
  progressErrors?: AsyncTaskStructuredErrorItem[];
  retrievalErrors?: AsyncTaskStructuredErrorItem[];
  retryAt?: string;
}

export interface IAsyncTaskError {
  body: string | AsyncTaskErrorBody;
  name: string;
}

export class AsyncTaskError implements IAsyncTaskError {
  constructor(name: string, message: string) {
    this.name = name;
    this.body = { detail: message };
  }

  name: string;

  body: AsyncTaskErrorBody;
}

export interface FileParsingTask {
  chunkCount?: number | null;
  chunkingError?: IAsyncTaskError | null;
  chunkingStatus?: AsyncTaskStatus | null;
  embeddingError?: IAsyncTaskError | null;
  embeddingStatus?: AsyncTaskStatus | null;
  finishEmbedding?: boolean;
}

export interface UserMemoryExtractionProgress {
  completedTopics: number;
  totalTopics: number | null;
}

/**
 * Provider metadata for Upstash workflow-backed async task runs.
 */
export interface UpstashWorkflowRunMetadata {
  /**
   * Workflow run id of the wrapper run that created this async task.
   */
  entryWorkflowRunId?: string;
  /**
   * Known workflow run ids associated with this task.
   */
  workflowRunIds?: string[];
}

export interface MemoryExtractionControlMetadata {
  cancelledBy?: 'system' | 'user' | 'webhook';
  cancelReason?: string;
  cancelRequestedAt?: string;
  upstash?: UpstashWorkflowRunMetadata;
}

export interface UserMemoryExtractionMetadata {
  control?: MemoryExtractionControlMetadata;
  progress: UserMemoryExtractionProgress;
  range?: {
    from?: string;
    to?: string;
  };
  source: 'chat_topic';
}

export interface HourlyUserMemoryExtractionProgress {
  processedUsers: number;
  scheduledBatches: number;
  scheduledChildRuns: number;
}

export interface HourlyUserMemoryExtractionMetadata {
  control?: MemoryExtractionControlMetadata;
  cursor?: {
    createdAt: string;
    id: string;
  };
  progress: HourlyUserMemoryExtractionProgress;
  source: 'hourly_chat_topic';
  startedAt: string;
}

export type VideoGenerationCompletionMode = 'polling' | 'webhook';

export interface VideoGenerationTaskMetadata {
  completionClaimedAt?: string;
  completionEventId?: string;
  completionMode?: VideoGenerationCompletionMode;
  precharge?: unknown;
  previousGenerationId?: string;
  route?: VideoGenerationRoute;
  webhookToken?: string;
}

export interface MusicGenerationTaskMetadata {
  index?: number;
  precharge?: unknown;
  route?: {
    channelId?: string;
    channelIndex?: number;
    model?: string;
    routerId?: string;
  };
  webhookToken?: string;
}

export interface VideoGenerationRoute {
  apiType: string;
  attemptId?: string;
  channelId?: string;
  routerId?: string;
}
