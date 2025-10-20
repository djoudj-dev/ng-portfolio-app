export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  visitorType?: VisitorType;
  page?: string;
}

export enum VisitorType {
  HUMAN = 'HUMAN',
  BOT = 'BOT',
}

export interface VisitStats {
  date: Date;
  period: string;
  visitorType: VisitorType;
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
  displayName: string;
  visitCount: number;
  uniqueVisitors: number;
  percentage: number;
  icon?: string;
  category?: 'search' | 'social' | 'direct' | 'referral' | 'tech' | 'unknown';
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
  timeline?: VisitStats[];
  botBreakdown?: BotBreakdown[];
  deviceStats?: DeviceStats[];
  locationStats?: LocationStats[];
}

export interface BotBreakdown {
  botName: string;
  botType: 'search' | 'social' | 'seo' | 'security' | 'unknown';
  visitCount: number;
  percentage: number;
  icon?: string;
  lastSeen: Date;
}

export interface DeviceStats {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  visitCount: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface LocationStats {
  country: string;
  countryCode: string;
  city?: string;
  visitCount: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface AnalyticsFilters {
  dateRange: { start: Date; end: Date };
  visitorType?: VisitorType | 'ALL';
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'ALL';
  country?: string | 'ALL';
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: { start: Date; end: Date };
  includeRawData: boolean;
  includeBots: boolean;
}
