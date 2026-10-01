import { Category, Dish } from "@/types";

export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
  displayOrder?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  isActive?: boolean;
}

export interface CreateDishDTO {
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  portion?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  dietaryType?: Dish["dietaryType"];
  imageUrl?: string | null;
  model3dUrl?: string | null;
  arEnabled?: boolean;
  isAvailable?: boolean;
  displayOrder?: number;
}

export interface UpdateDishDTO extends Partial<CreateDishDTO> {}

export interface IMenuService {
  // Categories
  listCategories(restaurantId: string): Promise<Category[]>;
  createCategory(restaurantId: string, dto: CreateCategoryDTO): Promise<Category>;
  updateCategory(restaurantId: string, categoryId: string, dto: UpdateCategoryDTO): Promise<Category>;
  deleteCategory(restaurantId: string, categoryId: string): Promise<void>;

  // Dishes
  listDishes(restaurantId: string, categoryId?: string): Promise<Dish[]>;
  getDishById(restaurantId: string, dishId: string): Promise<Dish | null>;
  createDish(restaurantId: string, dto: CreateDishDTO): Promise<Dish>;
  updateDish(restaurantId: string, dishId: string, dto: UpdateDishDTO): Promise<Dish>;
  deleteDish(restaurantId: string, dishId: string): Promise<void>;
  toggleDishAvailability(restaurantId: string, dishId: string, isAvailable: boolean): Promise<Dish>;
}
