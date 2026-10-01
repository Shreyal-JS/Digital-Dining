import { NextRequest } from "next/server";
import { getTenantContext, assertTenantOwnership } from "@/middleware/tenant-context";
import { analyticsService } from "@/features/analytics/analytics.service";
import { successResponse, forbiddenResponse, serverErrorResponse } from "@/utils/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const context = await getTenantContext(req);
    assertTenantOwnership(context, params.id);

    const metrics = await analyticsService.getDashboardMetrics(params.id);
    return successResponse(metrics);
  } catch (err: any) {
    if (err.name === "TenantAccessError") return forbiddenResponse(err.message);
    return serverErrorResponse("Failed to fetch analytics metrics", err);
  }
}
