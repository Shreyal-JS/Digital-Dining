import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { restaurantService } from "@/features/restaurants/restaurant.service";
import { updateRestaurantSchema } from "@/utils/validation";
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const restaurant = await restaurantService.getById(params.id);
    if (!restaurant) {
      return notFoundResponse("Restaurant not found");
    }

    return successResponse(restaurant);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to fetch restaurant", err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const body = await req.json();
    const parsed = updateRestaurantSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const updated = await restaurantService.update(params.id, parsed.data);
    return successResponse(updated);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to update restaurant", err);
  }
}
