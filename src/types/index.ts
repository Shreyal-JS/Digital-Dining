/**
 * SilvyOS Digital Dining Platform - Core Domain Types & Interfaces
 * Spec Reference: Section 8 (Menu Data Model) & Section 22 (API Design)
 */

export type Role = "RESTAURANT_ADMIN" | "RESTAURANT_STAFF" | "SUPER_ADMIN";
export type EntityStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type QrCodeStatus = "ACTIVE" | "REVOKED";
export type DietaryType = "VEGETARIAN" | "NON_VEGETARIAN" | "VEGAN" | "EGGETARIAN" | "OTHER";

export type AnalyticsEventType =
  | "menu_view"
  | "category_view"
  | "dish_view"
  | "ar_launch"
  | "model_3d_view"
  | "language_change"
  | "feedback_submit";

// =============================================================================
// Domain Models
// =============================================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  defaultLanguage: string;
  currency: string;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  restaurantId?: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations?: CategoryTranslation[];
  dishes?: Dish[];
}

export interface Dish {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  portion?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  dietaryType: DietaryType;
  imageUrl?: string | null;
  model3dUrl?: string | null;
  arEnabled: boolean;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  translations?: DishTranslation[];
}

export interface DishTranslation {
  id: string;
  dishId: string;
  languageCode: string;
  name: string;
  description?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  portion?: string | null;
}

export interface CategoryTranslation {
  id: string;
  categoryId: string;
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface RestaurantTranslation {
  id: string;
  restaurantId: string;
  languageCode: string;
  description?: string | null;
}

export interface QrCode {
  id: string;
  restaurantId: string;
  identifier: string;
  destinationUrl: string;
  status: QrCodeStatus;
  createdAt: Date;
}

export interface FeedbackReply {
  id?: string;
  text: string;
  author: string;
  createdAt: Date;
  isInternalNote?: boolean;
}

export interface Feedback {
  id: string;
  restaurantId: string;
  dishId?: string | null;
  rating: number; // 1 to 5
  comment?: string | null;
  languageCode: string;
  createdAt: Date;
  dinerName?: string;
  verifiedDineIn?: boolean;
  tags?: string[];
  sentiment?: "POSITIVE" | "NEUTRAL" | "CRITICAL";
  arMention?: boolean;
  staffReplies?: FeedbackReply[];
}

export interface AnalyticsEvent {
  id: string;
  restaurantId: string;
  dishId?: string | null;
  categoryId?: string | null;
  eventType: AnalyticsEventType;
  sessionId: string;
  languageCode?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

// =============================================================================
// Public Customer Menu DTOs
// =============================================================================

export interface PublicMenuResponse {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    currency: string;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  categories: {
    id: string;
    name: string;
    description?: string | null;
    displayOrder: number;
    dishes: PublicDishItem[];
  }[];
}

export interface PublicDishItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  portion?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  dietaryType: DietaryType;
  imageUrl?: string | null;
  model3dUrl?: string | null;
  arEnabled: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

// =============================================================================
// API & Auth Context Types
// =============================================================================

export interface AuthContext {
  userId: string;
  restaurantId?: string | null;
  role: Role;
  email: string;
  name: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// =============================================================================
// Dashboard Analytics Summary DTO
// =============================================================================

export interface DashboardMetrics {
  totalMenuViews: number;
  uniqueSessions: number;
  topDishes: { dishId: string; name: string; views: number }[];
  topCategories: { categoryId: string; name: string; views: number }[];
  arLaunches: number;
  model3dViews: number;
  languageDistribution: Record<string, number>;
  averageFeedbackRating: number;
  totalFeedbackCount: number;
}
