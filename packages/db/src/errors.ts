export class DbError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'DbError';
  }
}

export class UserNotFoundError extends DbError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}

export class WorkspaceNotFoundError extends DbError {
  constructor(message: string = 'Workspace not found') {
    super(message, 'WORKSPACE_NOT_FOUND');
    this.name = 'WorkspaceNotFoundError';
  }
}

export class ConflictError extends DbError {
  constructor(message: string = 'Resource already exists') {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends DbError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
