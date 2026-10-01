import { Role, AuthContext } from "@/types";

export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Asserts that the authenticated context has at least one of the allowed roles.
 */
export function assertRole(context: AuthContext, allowedRoles: Role[]): void {
  if (!allowedRoles.includes(context.role)) {
    throw new AuthorizationError(
      `Role '${context.role}' does not have required permissions. Required: ${allowedRoles.join(", ")}`
    );
  }
}
