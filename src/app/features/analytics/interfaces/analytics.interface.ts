export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  visitorType?: VisitorType;
  trafficSource?: TrafficSource;
  page?: string;
}

export enum VisitorType {
  HUMAN = 'HUMAN',
  BOT = 'BOT'
}

export enum TrafficSource {
  DIRECT = 'DIRECT',
  GOOGLE = 'GOOGLE',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  FACEBOOK = 'FACEBOOK',
  GITHUB = 'GITHUB',
  OTHER_SEARCH = 'OTHER_SEARCH',
  OTHER_SOCIAL = 'OTHER_SOCIAL',
  REFERRAL = 'REFERRAL',
  UNKNOWN = 'UNKNOWN'
}

export interface VisitStats {
  date: Date;
  period: string;
  visitorType: VisitorType;
  trafficSource: TrafficSource;
  page: string | null;
  visitCount: number;
  uniqueVisitors: number;
}

export interface TotalVisits {
  totalVisits: number;
  uniqueVisitors: number;
  humanVisits: number;
  botVisits: number;
}

export interface TrafficSourceBreakdown {
  trafficSource: TrafficSource;
  displayName: string;
  visitCount: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface TopPage {
  page: string;
  visitCount: number;
  uniqueVisitors: number;
}

export interface AnalyticsOverview {
  totals: TotalVisits;
  trafficSources: TrafficSourceBreakdown[];
  topPages: TopPage[];
  timeline: VisitStats[];
}