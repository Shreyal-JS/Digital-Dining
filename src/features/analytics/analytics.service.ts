import { IAnalyticsService, TrackEventDTO } from "./types";
import { AnalyticsEvent, DashboardMetrics } from "@/types";
import { MOCK_ANALYTICS_EVENTS, MOCK_DISHES, MOCK_CATEGORIES, MOCK_FEEDBACK } from "@/database/mock-data";

export class AnalyticsServiceStub implements IAnalyticsService {
  private events: AnalyticsEvent[] = [...MOCK_ANALYTICS_EVENTS];

  async trackEvent(dto: TrackEventDTO): Promise<AnalyticsEvent> {
    const event: AnalyticsEvent = {
      id: `ev_${Date.now()}`,
      restaurantId: dto.restaurantId,
      eventType: dto.eventType,
      sessionId: dto.sessionId,
      dishId: dto.dishId || null,
      categoryId: dto.categoryId || null,
      languageCode: dto.languageCode || null,
      metadata: dto.metadata || null,
      createdAt: new Date(),
    };
    this.events.push(event);
    return event;
  }

  async getDashboardMetrics(restaurantId: string): Promise<DashboardMetrics> {
    const restaurantEvents = this.events.filter((e) => e.restaurantId === restaurantId);
    const feedbackList = MOCK_FEEDBACK.filter((f) => f.restaurantId === restaurantId);

    const totalMenuViews = restaurantEvents.filter((e) => e.eventType === "menu_view").length;
    const uniqueSessions = new Set(restaurantEvents.map((e) => e.sessionId)).size;
    const arLaunches = restaurantEvents.filter((e) => e.eventType === "ar_launch").length;
    const model3dViews = restaurantEvents.filter((e) => e.eventType === "model_3d_view").length;

    // Top dishes
    const dishViewCounts: Record<string, number> = {};
    restaurantEvents
      .filter((e) => e.eventType === "dish_view" && e.dishId)
      .forEach((e) => {
        dishViewCounts[e.dishId!] = (dishViewCounts[e.dishId!] || 0) + 1;
      });

    const topDishes = Object.entries(dishViewCounts)
      .map(([dishId, count]) => {
        const dish = MOCK_DISHES.find((d) => d.id === dishId);
        return { dishId, name: dish?.name || "Unknown Dish", views: count };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top categories
    const categoryViewCounts: Record<string, number> = {};
    restaurantEvents
      .filter((e) => e.eventType === "category_view" && e.categoryId)
      .forEach((e) => {
        categoryViewCounts[e.categoryId!] = (categoryViewCounts[e.categoryId!] || 0) + 1;
      });

    const topCategories = Object.entries(categoryViewCounts)
      .map(([categoryId, count]) => {
        const cat = MOCK_CATEGORIES.find((c) => c.id === categoryId);
        return { categoryId, name: cat?.name || "Unknown Category", views: count };
      })
      .sort((a, b) => b.views - a.views);

    // Language distribution
    const languageDistribution: Record<string, number> = {};
    restaurantEvents.forEach((e) => {
      const lang = e.languageCode || "en";
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
    });

    const avgRating =
      feedbackList.length > 0
        ? feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length
        : 5.0;

    return {
      totalMenuViews,
      uniqueSessions,
      topDishes,
      topCategories,
      arLaunches,
      model3dViews,
      languageDistribution,
      averageFeedbackRating: Math.round(avgRating * 10) / 10,
      totalFeedbackCount: feedbackList.length,
    };
  }
}

export const analyticsService: IAnalyticsService = new AnalyticsServiceStub();
