export enum BadgeStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  AVAILABLE_FROM = 'AVAILABLE_FROM',
}

export interface Badge {
  id: string;
  status: BadgeStatus;
  availableFrom?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBadgeDto {
  status?: BadgeStatus;
  availableFrom?: string;
}

export interface UpdateBadgeDto {
  status?: BadgeStatus;
  availableFrom?: string;
}

export interface BadgeResponse {
  id: string;
  status: BadgeStatus;
  availableFrom?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBadgeRequest = CreateBadgeDto;
export type UpdateBadgeRequest = UpdateBadgeDto;
