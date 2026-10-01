import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { menuService } from "@/features/menu/menu.service";
import { createDishSchema } from "@/utils/validation";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
    const dishes = await menuService.listDishes(params.id, categoryId);
    return successResponse(dishes);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to list dishes", err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const body = await req.json();
    const parsed = createDishSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const created = await menuService.createDish(params.id, parsed.data);
    return successResponse(created, 201);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to create dish", err);
  }
}
