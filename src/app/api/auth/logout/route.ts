import { NextRequest } from "next/server";
import { successResponse } from "@/utils/api-response";
import { authService } from "@/features/auth/auth.service";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("silvyos_session")?.value;
  if (token) {
    await authService.logout(token);
  }

  const response = successResponse({ message: "Logged out successfully" });
  response.cookies.delete("silvyos_session");
  return response;
}
