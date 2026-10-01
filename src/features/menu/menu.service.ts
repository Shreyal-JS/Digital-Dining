import { IMenuService, CreateCategoryDTO, UpdateCategoryDTO, CreateDishDTO, UpdateDishDTO } from "./types";
import { Category, Dish } from "@/types";
import { MOCK_CATEGORIES, MOCK_DISHES } from "@/database/mock-data";

export class MenuServiceStub implements IMenuService {
  private categories: Category[] = [...MOCK_CATEGORIES];
  private dishes: Dish[] = [...MOCK_DISHES];

  async listCategories(restaurantId: string): Promise<Category[]> {
    return this.categories
      .filter((c) => c.restaurantId === restaurantId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async createCategory(restaurantId: string, dto: CreateCategoryDTO): Promise<Category> {
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      restaurantId,
      name: dto.name,
      description: dto.description || null,
      displayOrder: dto.displayOrder ?? this.categories.length + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(restaurantId: string, categoryId: string, dto: UpdateCategoryDTO): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === categoryId && c.restaurantId === restaurantId);
    if (index === -1) {
      throw new Error(`Category not found or does not belong to restaurant`);
    }

    const updated: Category = {
      ...this.categories[index],
      ...dto,
      updatedAt: new Date(),
    };
    this.categories[index] = updated;
    return updated;
  }

  async deleteCategory(restaurantId: string, categoryId: string): Promise<void> {
    const index = this.categories.findIndex((c) => c.id === categoryId && c.restaurantId === restaurantId);
    if (index === -1) {
      throw new Error(`Category not found or does not belong to restaurant`);
    }
    this.categories.splice(index, 1);
  }

  async listDishes(restaurantId: string, categoryId?: string): Promise<Dish[]> {
    return this.dishes.filter((d) => {
      const matchRestaurant = d.restaurantId === restaurantId;
      return categoryId ? matchRestaurant && d.categoryId === categoryId : matchRestaurant;
    });
  }

  async getDishById(restaurantId: string, dishId: string): Promise<Dish | null> {
    const dish = this.dishes.find((d) => d.id === dishId && d.restaurantId === restaurantId);
    return dish || null;
  }

  async createDish(restaurantId: string, dto: CreateDishDTO): Promise<Dish> {
    const newDish: Dish = {
      id: `dish_${Date.now()}`,
      restaurantId,
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description || null,
      price: dto.price,
      portion: dto.portion || null,
      ingredients: dto.ingredients || null,
      allergens: dto.allergens || null,
      dietaryType: dto.dietaryType || "VEGETARIAN",
      imageUrl: dto.imageUrl || null,
      model3dUrl: dto.model3dUrl || null,
      arEnabled: dto.arEnabled || false,
      isAvailable: dto.isAvailable ?? true,
      displayOrder: dto.displayOrder ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dishes.push(newDish);
    return newDish;
  }

  async updateDish(restaurantId: string, dishId: string, dto: UpdateDishDTO): Promise<Dish> {
    const index = this.dishes.findIndex((d) => d.id === dishId && d.restaurantId === restaurantId);
    if (index === -1) {
      throw new Error(`Dish not found or does not belong to restaurant`);
    }

    const updated: Dish = {
      ...this.dishes[index],
      ...dto,
      updatedAt: new Date(),
    };
    this.dishes[index] = updated;
    return updated;
  }

  async deleteDish(restaurantId: string, dishId: string): Promise<void> {
    const index = this.dishes.findIndex((d) => d.id === dishId && d.restaurantId === restaurantId);
    if (index === -1) {
      throw new Error(`Dish not found or does not belong to restaurant`);
    }
    this.dishes.splice(index, 1);
  }

  async toggleDishAvailability(restaurantId: string, dishId: string, isAvailable: boolean): Promise<Dish> {
    return this.updateDish(restaurantId, dishId, { isAvailable });
  }
}

export const menuService: IMenuService = new MenuServiceStub();
