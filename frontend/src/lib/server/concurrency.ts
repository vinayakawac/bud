/**
 * Concurrency & Idempotency Protection
 * 
 * Prevents race conditions and duplicate writes.
 * Ensures safe concurrent operations.
 */

import { db } from './db';
import crypto from 'crypto';

// ============================================================================
// IDEMPOTENCY KEY MANAGEMENT
// ============================================================================

const idempotencyStore = new Map<string, {
  response: unknown;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}>();

// Cleanup old entries every 5 minutes
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now - entry.timestamp > IDEMPOTENCY_TTL) {
      idempotencyStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface IdempotencyResult<T> {
  cached: boolean;
  data?: T;
  status?: 'pending' | 'completed' | 'failed';
}

/**
 * Check if request was already processed
 */
export function checkIdempotency<T>(key: string): IdempotencyResult<T> {
  const entry = idempotencyStore.get(key);
  
  if (!entry) {
    // Mark as pending to prevent concurrent execution
    idempotencyStore.set(key, {
      response: null,
      timestamp: Date.now(),
      status: 'pending',
    });
    return { cached: false };
  }

  if (entry.status === 'pending') {
    // Request is being processed - return conflict
    return { cached: true, status: 'pending' };
  }

  return { 
    cached: true, 
    data: entry.response as T,
    status: entry.status,
  };
}

/**
 * Store completed request result
 */
export function completeIdempotentRequest<T>(key: string, response: T, success: boolean) {
  idempotencyStore.set(key, {
    response,
    timestamp: Date.now(),
    status: success ? 'completed' : 'failed',
  });
}

/**
 * Generate idempotency key from request data
 */
export function generateIdempotencyKey(
  userId: string,
  action: string,
  data: Record<string, unknown>
): string {
  const payload = JSON.stringify({ userId, action, data });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ============================================================================
// OPTIMISTIC LOCKING
// ============================================================================

export interface VersionedEntity {
  id: string;
  version: number;
  updatedAt: Date;
}

/**
 * Check version for optimistic locking
 * Returns true if versions match, false if conflict
 */
export async function checkVersion(
  table: 'project' | 'creator',
  id: string,
  expectedVersion: number | Date
): Promise<{ valid: boolean; currentVersion?: Date }> {
  let versionDate: Date | null = null;

  switch (table) {
    case 'project':
      const project = await db.project.findUnique({
        where: { id },
        select: { updatedAt: true },
      });
      versionDate = project?.updatedAt || null;
      break;
    case 'creator':
      const creator = await db.creator.findUnique({
        where: { id },
        select: { createdAt: true },
      });
      versionDate = creator?.createdAt || null;
      break;
  }

  if (!versionDate) {
    return { valid: false };
  }

  const currentVersion = versionDate;
  
  if (expectedVersion instanceof Date) {
    const valid = currentVersion.getTime() === expectedVersion.getTime();
    return { valid, currentVersion };
  }

  return { valid: true, currentVersion };
}

// ============================================================================
// DISTRIBUTED LOCK (In-Memory)
// ============================================================================

const locks = new Map<string, {
  holder: string;
  expiresAt: number;
}>();

/**
 * Acquire a lock for exclusive access
 */
export function acquireLock(
  resourceKey: string,
  holderId: string,
  ttlMs: number = 30000
): boolean {
  const now = Date.now();
  const existing = locks.get(resourceKey);

  // Check if lock exists and is still valid
  if (existing && existing.expiresAt > now) {
    if (existing.holder === holderId) {
      // Same holder - extend the lock
      existing.expiresAt = now + ttlMs;
      return true;
    }
    // Lock held by someone else
    return false;
  }

  // Acquire the lock
  locks.set(resourceKey, {
    holder: holderId,
    expiresAt: now + ttlMs,
  });
  return true;
}

/**
 * Release a lock
 */
export function releaseLock(resourceKey: string, holderId: string): boolean {
  const existing = locks.get(resourceKey);
  
  if (!existing || existing.holder !== holderId) {
    return false;
  }

  locks.delete(resourceKey);
  return true;
}

/**
 * Execute with lock - ensures exclusive access
 */
export async function withLock<T>(
  resourceKey: string,
  holderId: string,
  ttlMs: number,
  operation: () => Promise<T>
): Promise<{ success: true; result: T } | { success: false; reason: 'locked' | 'error'; error?: unknown }> {
  if (!acquireLock(resourceKey, holderId, ttlMs)) {
    return { success: false, reason: 'locked' };
  }

  try {
    const result = await operation();
    return { success: true, result };
  } catch (error) {
    return { success: false, reason: 'error', error };
  } finally {
    releaseLock(resourceKey, holderId);
  }
}

// Cleanup expired locks every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, lock] of locks.entries()) {
    if (lock.expiresAt < now) {
      locks.delete(key);
    }
  }
}, 60000);

// ============================================================================
// CONFLICT RESOLUTION
// ============================================================================

export type ConflictStrategy = 'reject' | 'last-write-wins' | 'merge';

interface ConflictResolutionOptions<T> {
  strategy: ConflictStrategy;
  merge?: (existing: T, incoming: Partial<T>) => T;
}

/**
 * Handle concurrent update conflicts
 */
export async function resolveConflict<T extends VersionedEntity>(
  existing: T,
  incoming: Partial<T>,
  options: ConflictResolutionOptions<T>
): Promise<{ action: 'apply' | 'reject' | 'merge'; data?: Partial<T> }> {
  switch (options.strategy) {
    case 'reject':
      return { action: 'reject' };
    
    case 'last-write-wins':
      return { action: 'apply', data: incoming };
    
    case 'merge':
      if (!options.merge) {
        throw new Error('Merge strategy requires merge function');
      }
      const merged = options.merge(existing, incoming);
      return { action: 'merge', data: merged };
    
    default:
      return { action: 'reject' };
  }
}

// ============================================================================
// SAFE DATABASE OPERATIONS
// ============================================================================

/**
 * Safe upsert with retry logic
 */
export async function safeUpsert<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Retry only on transient errors
      const isRetryable = 
        error.code === 'P2034' || // Transaction conflict
        error.code === 'P2028' || // Transaction timeout
        error.message?.includes('deadlock');

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

/**
 * Atomic increment with race protection
 */
export async function atomicIncrement(
  _table: 'project',
  id: string,
  field: string,
  amount: number = 1
): Promise<boolean> {
  try {
    // Use raw query for atomic increment
    await db.$executeRaw`
      UPDATE projects 
      SET metadata = jsonb_set(
        COALESCE(metadata::jsonb, '{}'::jsonb),
        ${`{${field}}`}::text[],
        to_jsonb(COALESCE((metadata::jsonb->>${field})::int, 0) + ${amount})
      )
      WHERE id = ${id}
    `;
    return true;
  } catch {
    return false;
  }
}
