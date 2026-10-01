import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { menuService } from "@/features/menu/menu.service";
import { createCategorySchema } from "@/utils/validation";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const categories = await menuService.listCategories(params.id);
    return successResponse(categories);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to list categories", err);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const created = await menuService.createCategory(params.id, parsed.data);
    return successResponse(created, 201);
  } catch (err: any) {
    if (err.name === "TenantAccessError") {
      return forbiddenResponse(err.message);
    }
    return serverErrorResponse("Failed to create category", err);
  }
}
