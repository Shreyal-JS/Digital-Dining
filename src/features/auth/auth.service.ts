import { IAuthService, LoginCredentials, AuthSession } from "./types";
import { AuthContext } from "@/types";
import { MOCK_USERS } from "@/database/mock-data";

export class AuthServiceStub implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // In production implementation: compare bcrypt hash
    const { passwordHash: _, ...userWithoutPass } = user;

    return {
      user: userWithoutPass,
      token: `mock_jwt_session_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async logout(token: string): Promise<void> {
    // In production: invalidate session/token in cache/db
    void token;
  }

  async validateSession(token: string): Promise<AuthContext | null> {
    if (!token) return null;
    const user = MOCK_USERS[0];
    return {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
      email: user.email,
      name: user.name,
    };
  }
}

export const authService: IAuthService = new AuthServiceStub();
