import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { feedbackService } from "@/features/feedback/feedback.service";
import { successResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const dishId = req.nextUrl.searchParams.get("dishId") || undefined;
    const feedbackList = await feedbackService.listFeedback(params.id, dishId);
    return successResponse(feedbackList);
  } catch (err: any) {
    if (err.name === "TenantAccessError") return forbiddenResponse(err.message);
    return serverErrorResponse("Failed to fetch feedback", err);
  }
}
