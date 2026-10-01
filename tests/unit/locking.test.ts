import { describe, it, expect } from "vitest";
import { lockManager, LockAcquisitionError } from "@/utils/locking";

describe("Concurrency Locking Infrastructure", () => {
  it("acquires and releases a lock successfully", async () => {
    const resourceKey = "menu:update:rest_01";
    const acquired = await lockManager.acquire(resourceKey, 2000);
    expect(acquired).toBe(true);

    // Second attempt should fail while held
    const secondAttempt = await lockManager.acquire(resourceKey, 2000);
    expect(secondAttempt).toBe(false);

    const released = await lockManager.release(resourceKey);
    expect(released).toBe(true);

    // Can acquire again after release
    const reacquired = await lockManager.acquire(resourceKey, 2000);
    expect(reacquired).toBe(true);
    await lockManager.release(resourceKey);
  });

  it("executes critical sections within withLock safely", async () => {
    const resourceKey = "qr:generate:rest_01";
    let executionFlag = false;

    const result = await lockManager.withLock(resourceKey, async () => {
      executionFlag = true;
      return "SUCCESS_DATA";
    });

    expect(result).toBe("SUCCESS_DATA");
    expect(executionFlag).toBe(true);

    // Lock must be released automatically after withLock completes
    const canAcquireAgain = await lockManager.acquire(resourceKey, 1000);
    expect(canAcquireAgain).toBe(true);
    await lockManager.release(resourceKey);
  });
});
