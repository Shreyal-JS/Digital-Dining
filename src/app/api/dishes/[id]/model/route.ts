import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { menuService } from "@/features/menu/menu.service";
import { arService } from "@/features/ar/ar.service";
import { storageService } from "@/services/storage/storage.service";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    if (!context.restaurantId) return forbiddenResponse("No tenant context");
    assertTenantOwnership(context, context.restaurantId);

    const formData = await req.formData();
    const file = formData.get("model") as File | null;
    const enableAr = formData.get("arEnabled") === "true";

    if (!file) {
      return errorResponse("No 3D model file provided", "FILE_REQUIRED", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Spec Section 10 & Section 29 Rule 9: 3D models must be validated before storage
    const validation = await arService.validateModel(buffer, file.name);

    if (!validation.isValid) {
      return errorResponse(validation.errorMessage || "Invalid 3D model", "INVALID_MODEL", 400);
    }

    const stored = await storageService.upload(buffer, {
      folder: "models",
      fileName: file.name,
      contentType: "model/gltf-binary",
    });

    const updated = await menuService.updateDish(context.restaurantId, params.id, {
      model3dUrl: stored.url,
      arEnabled: enableAr,
    });

    return successResponse(updated);
  } catch (err: any) {
    if (err.name === "TenantAccessError") return forbiddenResponse(err.message);
    return serverErrorResponse("3D model upload failed", err);
  }
}
