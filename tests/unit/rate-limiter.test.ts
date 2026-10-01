import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/middleware/rate-limiter";

describe("Anti-Spam Sliding Rate Limiter", () => {
  it("allows requests under the specified limit threshold", () => {
    const key = `test_ip_${Date.now()}`;
    const r1 = checkRateLimit(key, 3, 5000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, 3, 5000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks requests once the threshold limit is exceeded", () => {
    const key = `test_blocked_ip_${Date.now()}`;
    checkRateLimit(key, 2, 5000);
    checkRateLimit(key, 2, 5000);

    const r3 = checkRateLimit(key, 2, 5000);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });
});
