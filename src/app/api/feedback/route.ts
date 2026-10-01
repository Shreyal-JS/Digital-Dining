import { NextRequest } from "next/server";
import { feedbackService } from "@/features/feedback/feedback.service";
import { createFeedbackSchema } from "@/utils/validation";
import { checkRateLimit } from "@/middleware/rate-limiter";
import { successResponse, errorResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client_ip";
    const rate = checkRateLimit(`feedback:${ip}`, 5, 60000);
    if (!rate.allowed) {
      return errorResponse("Too many feedback submissions. Please wait a minute.", "RATE_LIMIT_EXCEEDED", 429);
    }

    const body = await req.json();
    const parsed = createFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const created = await feedbackService.submitFeedback(parsed.data);
    return successResponse(created, 201);
  } catch (err: any) {
    return serverErrorResponse("Failed to submit feedback", err);
  }
}
