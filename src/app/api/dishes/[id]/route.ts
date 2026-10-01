import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { menuService } from "@/features/menu/menu.service";
import { updateDishSchema } from "@/utils/validation";
import { successResponse, errorResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    if (!context.restaurantId) return forbiddenResponse("No tenant context");
    assertTenantOwnership(context, context.restaurantId);

    const dish = await menuService.getDishById(context.restaurantId, params.id);
    if (!dish) {
      return notFoundResponse("Dish not found");
    }

    return successResponse(dish);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to fetch dish", err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    if (!context.restaurantId) return forbiddenResponse("No tenant context");
    assertTenantOwnership(context, context.restaurantId);

    const body = await req.json();
    const parsed = updateDishSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const updated = await menuService.updateDish(context.restaurantId, params.id, parsed.data);
    return successResponse(updated);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to update dish", err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    if (!context.restaurantId) return forbiddenResponse("No tenant context");
    assertTenantOwnership(context, context.restaurantId);

    await menuService.deleteDish(context.restaurantId, params.id);
    return successResponse({ deleted: true });
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to delete dish", err);
  }
}
