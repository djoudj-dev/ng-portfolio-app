export interface Activity {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  description: string;
  timestamp: Date;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export enum ActivityType {
  BADGE = 'BADGE',
  PROJECT = 'PROJECT',
  CV = 'CV',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  USER = 'USER'
}

export enum ActivityAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  UPLOADED = 'UPLOADED',
  DOWNLOADED = 'DOWNLOADED',
  SENT = 'SENT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum EntityType {
  BADGE = 'BADGE',
  PROJECT = 'PROJECT',
  CV = 'CV',
  MESSAGE = 'MESSAGE',
  USER = 'USER'
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
}
