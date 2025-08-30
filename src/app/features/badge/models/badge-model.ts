export type BadgeStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'AVAILABLE_FROM';

export const BADGE_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  UNAVAILABLE: 'UNAVAILABLE' as const,
  AVAILABLE_FROM: 'AVAILABLE_FROM' as const,
} as const;

// Interface principale Badge (corresponded à l'API backend)
export interface Badge {
  id: string;
  status: BadgeStatus;
  availableFrom?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// DTO pour les requêtes API
export interface CreateBadgeRequest {
  status: BadgeStatus;
  availableFrom?: string | null;
}

export interface UpdateBadgeRequest {
  status?: BadgeStatus;
  availableFrom?: string | null;
}

// DTO pour les réponses API (format JSON)
export interface BadgeResponse {
  id: string;
  status: BadgeStatus;
  availableFrom?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les filtres
export interface BadgeFilters {
  status?: BadgeStatus;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Interface pour la pagination
export interface BadgeListResponse {
  badges: BadgeResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type pour les états de chargement
export interface BadgeState {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  filters: BadgeFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fonctions utilitaires pour la transformation des données
export function badgeFromResponse(response: BadgeResponse): Badge {
  return {
    id: response.id,
    status: response.status,
    availableFrom: response.availableFrom ? new Date(response.availableFrom) : null,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  };
}

export function badgeToRequest(badge: Partial<Badge>): CreateBadgeRequest {
  return {
    status: badge.status!,
    availableFrom: badge.availableFrom?.toISOString() ?? null,
  };
}

// Interface legacy pour compatibilité (deprecated)
/** @deprecated Use Badge interface instead */
export interface BadgeModel extends Badge {
  available_from: string | null;
  created_at: string;
  updated_at: string;
}
