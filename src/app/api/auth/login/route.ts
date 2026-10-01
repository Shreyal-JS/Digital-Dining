import { NextRequest } from "next/server";
import { loginSchema } from "@/utils/validation";
import { authService } from "@/features/auth/auth.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", "INVALID_INPUT", 400, parsed.error.format());
    }

    const session = await authService.login(parsed.data);
    const response = successResponse({
      user: session.user,
      token: session.token,
    });

    response.cookies.set("silvyos_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    if (err.message === "Invalid email or password") {
      return errorResponse(err.message, "UNAUTHORIZED", 401);
    }
    return serverErrorResponse("Login failed", err);
  }
}
