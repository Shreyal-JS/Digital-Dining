import { describe, it, expect } from "vitest";
import { assertTenantOwnership, TenantAccessError } from "@/middleware/tenant-context";
import { AuthContext } from "@/types";

describe("Tenant Isolation Guard", () => {
  const restaurantUser: AuthContext = {
    userId: "user_101",
    restaurantId: "rest_pilot_01",
    role: "RESTAURANT_ADMIN",
    email: "admin@pilot01.com",
    name: "Pilot 01 Admin",
  };

  const superAdminUser: AuthContext = {
    userId: "user_super",
    restaurantId: null,
    role: "SUPER_ADMIN",
    email: "root@silvyos.com",
    name: "System Admin",
  };

  it("permits access when user belongs to the requested restaurant", () => {
    expect(() => {
      assertTenantOwnership(restaurantUser, "rest_pilot_01");
    }).not.toThrow();
  });

  it("strictly throws TenantAccessError when user attempts to access another restaurant", () => {
    expect(() => {
      assertTenantOwnership(restaurantUser, "rest_other_restaurant_99");
    }).toThrow(TenantAccessError);
  });

  it("permits Super Admin to access any tenant resource", () => {
    expect(() => {
      assertTenantOwnership(superAdminUser, "rest_pilot_01");
      assertTenantOwnership(superAdminUser, "rest_other_restaurant_99");
    }).not.toThrow();
  });
});
