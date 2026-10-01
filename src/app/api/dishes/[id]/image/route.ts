import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { menuService } from "@/features/menu/menu.service";
import { storageService } from "@/services/storage/storage.service";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    if (!context.restaurantId) return forbiddenResponse("No tenant context");
    assertTenantOwnership(context, context.restaurantId);

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return errorResponse("No image file provided", "FILE_REQUIRED", 400);
    }

    // Spec Section 29 Rule 9: Images must be validated before storage
    if (!file.type.startsWith("image/")) {
      return errorResponse("Only image files are allowed", "INVALID_FILE_TYPE", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("Image size exceeds 5MB limit", "FILE_TOO_LARGE", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storageService.upload(buffer, {
      folder: "images",
      fileName: file.name,
      contentType: file.type,
    });

    const updated = await menuService.updateDish(context.restaurantId, params.id, {
      imageUrl: stored.url,
    });

    return successResponse(updated);
  } catch (err: any) {
    if (err.name === "TenantAccessError") return forbiddenResponse(err.message);
    return serverErrorResponse("Image upload failed", err);
  }
}
