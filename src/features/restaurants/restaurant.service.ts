import { IRestaurantService } from "./types";
import { Restaurant, PublicMenuResponse } from "@/types";
import { MOCK_RESTAURANTS, MOCK_CATEGORIES, MOCK_DISHES, MOCK_DISH_TRANSLATIONS } from "@/database/mock-data";
import { resolveTranslation } from "@/utils/language";

export class RestaurantServiceStub implements IRestaurantService {
  async getById(restaurantId: string): Promise<Restaurant | null> {
    const restaurant = MOCK_RESTAURANTS.find((r) => r.id === restaurantId);
    return restaurant || null;
  }

  async getBySlug(slug: string): Promise<Restaurant | null> {
    const restaurant = MOCK_RESTAURANTS.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
    return restaurant || null;
  }

  async update(restaurantId: string, payload: Partial<Restaurant>): Promise<Restaurant> {
    const restaurant = await this.getById(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant ${restaurantId} not found`);
    }
    return { ...restaurant, ...payload, updatedAt: new Date() };
  }

  async getPublicMenu(slug: string, targetLanguage?: string): Promise<PublicMenuResponse | null> {
    const restaurant = await this.getBySlug(slug);
    if (!restaurant) return null;

    const lang = targetLanguage || restaurant.defaultLanguage;
    const categories = MOCK_CATEGORIES.filter((c) => c.restaurantId === restaurant.id && c.isActive);

    const categoriesWithDishes = categories.map((cat) => {
      const dishes = MOCK_DISHES.filter((d) => d.categoryId === cat.id && d.isAvailable).map((dish) => {
        const dishTranslations = MOCK_DISH_TRANSLATIONS.filter((dt) => dt.dishId === dish.id);
        const localized = resolveTranslation(dish, dishTranslations, lang, restaurant.defaultLanguage);
        return {
          id: localized.id,
          name: localized.name,
          description: localized.description,
          price: localized.price,
          portion: localized.portion,
          ingredients: localized.ingredients,
          allergens: localized.allergens,
          dietaryType: localized.dietaryType,
          imageUrl: localized.imageUrl,
          model3dUrl: localized.model3dUrl,
          arEnabled: localized.arEnabled,
          isAvailable: localized.isAvailable,
          displayOrder: localized.displayOrder,
        };
      });

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        dishes,
      };
    });

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
        description: restaurant.description,
        currency: restaurant.currency,
        defaultLanguage: restaurant.defaultLanguage,
        supportedLanguages: ["en", "hi", "mr"],
      },
      categories: categoriesWithDishes,
    };
  }
}

export const restaurantService: IRestaurantService = new RestaurantServiceStub();
