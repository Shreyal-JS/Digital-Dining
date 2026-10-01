import { z } from "zod";

// =============================================================================
// Auth Schemas
// =============================================================================
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// =============================================================================
// Restaurant Schemas
// =============================================================================
export const updateRestaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().nullable().optional(),
  address: z.string().max(250).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  defaultLanguage: z.string().min(2).max(5).optional(),
  currency: z.string().min(1).max(5).optional(),
});

// =============================================================================
// Category Schemas
// =============================================================================
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  description: z.string().max(250).optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// =============================================================================
// Dish Schemas
// =============================================================================
export const createDishSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().min(1, "Dish name is required").max(100),
  description: z.string().max(1000).optional(),
  price: z.number().positive("Price must be a positive number"),
  portion: z.string().max(50).optional(),
  ingredients: z.string().max(500).optional(),
  allergens: z.string().max(200).optional(),
  dietaryType: z.enum(["VEGETARIAN", "NON_VEGETARIAN", "VEGAN", "EGGETARIAN", "OTHER"]).default("VEGETARIAN"),
  imageUrl: z.string().url().nullable().optional(),
  model3dUrl: z.string().url().nullable().optional(),
  arEnabled: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateDishSchema = createDishSchema.partial();

// =============================================================================
// Feedback Schemas
// =============================================================================
export const createFeedbackSchema = z.object({
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  dishId: z.string().uuid("Invalid dish ID").nullable().optional(),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(500).optional(),
  languageCode: z.string().min(2).max(10).default("en"),
});

// =============================================================================
// Analytics Event Schemas
// =============================================================================
export const createAnalyticsEventSchema = z.object({
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  dishId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  eventType: z.enum([
    "menu_view",
    "category_view",
    "dish_view",
    "ar_launch",
    "model_3d_view",
    "language_change",
    "feedback_submit",
  ]),
  sessionId: z.string().min(5).max(100),
  languageCode: z.string().max(10).optional(),
  metadata: z.record(z.unknown()).optional(),
});
