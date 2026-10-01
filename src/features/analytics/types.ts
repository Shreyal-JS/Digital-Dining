import { AnalyticsEvent, DashboardMetrics, AnalyticsEventType } from "@/types";

export interface TrackEventDTO {
  restaurantId: string;
  eventType: AnalyticsEventType;
  sessionId: string;
  dishId?: string | null;
  categoryId?: string | null;
  languageCode?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface IAnalyticsService {
  trackEvent(dto: TrackEventDTO): Promise<AnalyticsEvent>;
  getDashboardMetrics(restaurantId: string, startDate?: Date, endDate?: Date): Promise<DashboardMetrics>;
}
