import { Restaurant, PublicMenuResponse } from "@/types";

export interface IRestaurantService {
  getById(restaurantId: string): Promise<Restaurant | null>;
  getBySlug(slug: string): Promise<Restaurant | null>;
  update(restaurantId: string, payload: Partial<Restaurant>): Promise<Restaurant>;
  getPublicMenu(slug: string, targetLanguage?: string): Promise<PublicMenuResponse | null>;
}
