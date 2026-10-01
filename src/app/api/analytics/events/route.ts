import { NextRequest } from "next/server";
import { analyticsService } from "@/features/analytics/analytics.service";
import { createAnalyticsEventSchema } from "@/utils/validation";
import { checkRateLimit } from "@/middleware/rate-limiter";
import { successResponse, errorResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client_session";
    const rate = checkRateLimit(`analytics:${ip}`, 60, 60000);
    if (!rate.allowed) {
      return errorResponse("Rate limit exceeded", "RATE_LIMIT_EXCEEDED", 429);
    }

    const body = await req.json();
    const parsed = createAnalyticsEventSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const event = await analyticsService.trackEvent(parsed.data);
    return successResponse(event, 201);
  } catch (err: any) {
    return serverErrorResponse("Failed to record analytics event", err);
  }
}
