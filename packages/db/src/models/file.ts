import { and, desc, eq } from 'drizzle-orm';

import type { FileItem, NewFile } from '../schemas/file';
import { files } from '../schemas/file';
import { filesToSessions } from '../schemas/session';
import type { AppDatabase } from '../type';
import { idGenerator } from '../utils/idGenerator';

export class FileModel {
  private userId: string;
  private db: AppDatabase;
  private workspaceId?: string;

  constructor(db: AppDatabase, userId: string, workspaceId?: string) {
    this.userId = userId;
    this.db = db;
    this.workspaceId = workspaceId;
  }

  create = async (params: Omit<NewFile, 'id' | 'userId'> & { id?: string }): Promise<FileItem> => {
    const id = params.id ?? idGenerator('files');

    const [created] = await this.db
      .insert(files)
      .values({
        id,
        userId: this.userId,
        workspaceId: this.workspaceId ?? null,
        ...params
      })
      .returning();

    return created;
  };

  findById = async (id: string): Promise<FileItem | undefined> => {
    return this.db.query.files.findFirst({
      where: eq(files.id, id)
    });
  };

  list = async (options?: {
    limit?: number;
    offset?: number;
    workspaceId?: string;
  }): Promise<FileItem[]> => {
    const wsId = options?.workspaceId ?? this.workspaceId;
    const conditions = [eq(files.userId, this.userId)];

    if (wsId) {
      conditions.push(eq(files.workspaceId, wsId));
    }

    return this.db.query.files.findMany({
      where: and(...conditions),
      orderBy: [desc(files.createdAt)],
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0
    });
  };

  delete = async (id: string): Promise<void> => {
    await this.db.delete(files).where(and(eq(files.id, id), eq(files.userId, this.userId)));
  };

  attachToSession = async (fileId: string, sessionId: string): Promise<void> => {
    await this.db.insert(filesToSessions).values({ fileId, sessionId }).onConflictDoNothing();
  };

  detachFromSession = async (fileId: string, sessionId: string): Promise<void> => {
    await this.db
      .delete(filesToSessions)
      .where(and(eq(filesToSessions.fileId, fileId), eq(filesToSessions.sessionId, sessionId)));
  };

  getSessionFiles = async (sessionId: string): Promise<FileItem[]> => {
    const relations = await this.db.query.filesToSessions.findMany({
      where: eq(filesToSessions.sessionId, sessionId),
      with: {
        file: true
      }
    });

    return relations.map((r: { file: FileItem }) => r.file).filter(Boolean);
  };
}
