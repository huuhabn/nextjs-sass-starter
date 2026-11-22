export enum FilesTabs {
  All = 'all',
  Audios = 'audios',
  Documents = 'documents',
  Files = 'files',
  Home = 'home',
  Images = 'images',
  Pages = 'pages',
  Videos = 'videos',
  Websites = 'websites'
}

export enum FileSource {
  Acceptance = 'acceptance',
  AgentDocument = 'agent-document',
  Canvas = 'canvas',
  ChatAttachment = 'chat-attachment',
  ImageGeneration = 'image_generation',
  Meeting = 'meeting',
  MusicGeneration = 'music_generation',
  PageEditor = 'page-editor',
  Skill = 'skill',
  ToolResult = 'tool-result',
  VideoGeneration = 'video_generation'
}

export const LIBRARY_HIDDEN_FILE_SOURCES: FileSource[] = [
  FileSource.Acceptance,
  FileSource.AgentDocument,
  FileSource.Canvas,
  FileSource.Meeting,
  FileSource.ToolResult,
  FileSource.ChatAttachment,
  FileSource.Skill
];

export const AI_GENERATED_FILE_SOURCES: FileSource[] = [
  FileSource.ImageGeneration,
  FileSource.MusicGeneration,
  FileSource.VideoGeneration
];

const FILE_SOURCE_VALUES = new Set<string>(Object.values(FileSource));

export const toFileSource = (source?: string | null): FileSource | undefined =>
  source && FILE_SOURCE_VALUES.has(source) ? (source as FileSource) : undefined;

export interface FileItem {
  content?: string;
  createdAt: Date;
  enabled?: boolean;
  id: string;
  name: string;
  originalCharCount?: number;
  size: number;
  source?: FileSource | null;
  type: string;
  updatedAt: Date;
  url: string;
}

export * from './list';
export * from './upload';
