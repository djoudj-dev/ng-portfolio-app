export type BadgeStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "AVAILABLE_FROM"
  | "UPCOMING";

export const BADGE_STATUS = {
  AVAILABLE: "AVAILABLE",
  UNAVAILABLE: "UNAVAILABLE",
  AVAILABLE_FROM: "AVAILABLE_FROM",
};

export interface BadgeModel {
  id: string;
  status: BadgeStatus;
  available_from: string | null;
  created_at: string;
  updated_at: string;
}
