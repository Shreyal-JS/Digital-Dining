/**
 * Concurrency Locking Infrastructure
 * Provides mutual exclusion and distributed lock abstractions for multi-tenant critical sections
 * (e.g., menu updates, QR regeneration, slug allocation, asset processing).
 */

export interface ILockManager {
  acquire(resourceKey: string, ttlMs?: number): Promise<boolean>;
  release(resourceKey: string): Promise<boolean>;
  withLock<T>(resourceKey: string, fn: () => Promise<T>, ttlMs?: number): Promise<T>;
}

export class LockAcquisitionError extends Error {
  constructor(public resourceKey: string) {
    super(`Could not acquire lock for resource: ${resourceKey}`);
    this.name = "LockAcquisitionError";
  }
}

/**
 * In-Memory Lock Provider for local development & single-instance node environments.
 * For production multi-instance clusters, a Redis (Redlock) or Postgres advisory lock adapter implements ILockManager.
 */
class InMemoryLockManager implements ILockManager {
  private locks = new Map<string, { expiresAt: number }>();

  async acquire(resourceKey: string, ttlMs = 10000): Promise<boolean> {
    const now = Date.now();
    const existing = this.locks.get(resourceKey);

    if (existing && existing.expiresAt > now) {
      return false; // Resource is currently locked
    }

    this.locks.set(resourceKey, { expiresAt: now + ttlMs });
    return true;
  }

  async release(resourceKey: string): Promise<boolean> {
    return this.locks.delete(resourceKey);
  }

  async withLock<T>(resourceKey: string, fn: () => Promise<T>, ttlMs = 10000): Promise<T> {
    const acquired = await this.acquire(resourceKey, ttlMs);
    if (!acquired) {
      throw new LockAcquisitionError(resourceKey);
    }

    try {
      return await fn();
    } finally {
      await this.release(resourceKey);
    }
  }

  // Periodic cleanup helper
  cleanup(): void {
    const now = Date.now();
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
      }
    }
  }
}

export const lockManager: ILockManager = new InMemoryLockManager();
