import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export function successResponse<T>(data: T, status = 200, meta?: ApiResponse["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse<ApiResponse<never>> {
  return errorResponse(message, "UNAUTHORIZED", 401);
}

export function forbiddenResponse(message = "Forbidden"): NextResponse<ApiResponse<never>> {
  return errorResponse(message, "FORBIDDEN", 403);
}

export function notFoundResponse(message = "Resource not found"): NextResponse<ApiResponse<never>> {
  return errorResponse(message, "NOT_FOUND", 404);
}

export function serverErrorResponse(
  message = "Internal server error",
  error?: unknown
): NextResponse<ApiResponse<never>> {
  // eslint-disable-next-line no-console
  console.error("[ServerError]:", error);
  return errorResponse(message, "INTERNAL_SERVER_ERROR", 500);
}
