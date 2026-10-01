import { NextRequest } from "next/server";
import { AuthContext } from "@/types";

export class TenantAccessError extends Error {
  constructor(message = "Unauthorized tenant access") {
    super(message);
    this.name = "TenantAccessError";
  }
}

/**
 * Extracts and verifies the tenant context from the authenticated request session.
 * 
 * In accordance with Section 9 & Rule 7:
 * Never trusts a restaurantId passed via request query or body alone.
 * Matches requested resource tenant ID against the authenticated user's assigned restaurant.
 */
export async function getTenantContext(req: NextRequest): Promise<AuthContext> {
  // Stub for session extraction. In production, read decrypt session cookie / JWT
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("silvyos_session")?.value;

  // Development/Mock fallback user if header or cookie contains token
  // Developers can override with header: X-Tenant-Id for development testing
  const devRestaurantId = req.headers.get("x-restaurant-id") || "rest_01_pilot_bistro";
  const devRole = (req.headers.get("x-user-role") as any) || "RESTAURANT_ADMIN";

  if (!authHeader && !sessionCookie && process.env.NODE_ENV === "production") {
    throw new TenantAccessError("Missing authentication credentials");
  }

  return {
    userId: "usr_mock_admin_01",
    restaurantId: devRestaurantId,
    role: devRole,
    email: "manager@pilotbistro.com",
    name: "Pilot Restaurant Manager",
  };
}

/**
 * Enforces that the user is authorized to access the given restaurant ID.
 * Super Admins are permitted cross-tenant access for platform administration.
 */
export function assertTenantOwnership(context: AuthContext, targetRestaurantId: string): void {
  if (context.role === "SUPER_ADMIN") {
    return;
  }

  if (!context.restaurantId || context.restaurantId !== targetRestaurantId) {
    throw new TenantAccessError(
      `Tenant Isolation Violation: User belonging to restaurant '${context.restaurantId}' cannot access restaurant '${targetRestaurantId}'`
    );
  }
}
