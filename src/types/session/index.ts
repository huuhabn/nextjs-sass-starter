export * from './session';

export interface UpdateSessionParams {
  meta?: any;
  pinned?: boolean;
  updatedAt: Date;
}
