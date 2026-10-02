import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { feedbackService } from "@/features/feedback/feedback.service";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; feedbackId: string } }
) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const body = await req.json();
    if (!body.text || !body.text.trim()) {
      return errorResponse("Reply text cannot be empty", "INVALID_INPUT", 400);
    }

    const updated = await feedbackService.addStaffReply(params.id, params.feedbackId, {
      text: body.text.trim(),
      author: body.author || context.name || "Restaurant Staff",
      createdAt: new Date(),
      isInternalNote: Boolean(body.isInternalNote),
    });

    return successResponse(updated);
  } catch (err: any) {
    if (err.name === "TenantAccessError") return forbiddenResponse(err.message);
    return serverErrorResponse("Failed to add staff reply", err);
  }
}

