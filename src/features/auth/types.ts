import { User, AuthContext } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: Omit<User, "passwordHash">;
  token: string;
  expiresAt: Date;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(token: string): Promise<void>;
  validateSession(token: string): Promise<AuthContext | null>;
}
