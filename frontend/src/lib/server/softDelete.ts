/**
 * Soft Delete & Safe Deletion Utilities
 * 
 * Provides safe deletion patterns that preserve data integrity
 * and enable recovery from accidental deletions.
 */

import { db } from './db';

// ============================================================================
// SOFT DELETE OPERATIONS
// ============================================================================

type SoftDeleteTable = 'project' | 'comment' | 'rating' | 'creator';

/**
 * Soft delete an entity by setting deletedAt timestamp
 */
export async function softDelete(
  table: SoftDeleteTable,
  id: string,
  deletedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date();

    switch (table) {
      case 'project':
        await db.project.update({
          where: { id },
          data: { deletedAt: now } as any,
        });
        break;
      case 'comment':
        await db.comment.update({
          where: { id },
          data: { deletedAt: now } as any,
        });
        break;
      case 'rating':
        await db.rating.update({
          where: { id },
          data: { deletedAt: now } as any,
        });
        break;
      case 'creator':
        await db.creator.update({
          where: { id },
          data: { deletedAt: now } as any,
        });
        break;
    }

    console.log(`[SoftDelete] ${table}:${id} deleted by ${deletedBy || 'system'}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SoftDelete] Failed to delete ${table}:${id}`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore a soft-deleted entity
 */
export async function restore(
  table: SoftDeleteTable,
  id: string,
  restoredBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (table) {
      case 'project':
        await db.project.update({
          where: { id },
          data: { deletedAt: null } as any,
        });
        break;
      case 'comment':
        await db.comment.update({
          where: { id },
          data: { deletedAt: null } as any,
        });
        break;
      case 'rating':
        await db.rating.update({
          where: { id },
          data: { deletedAt: null } as any,
        });
        break;
      case 'creator':
        await db.creator.update({
          where: { id },
          data: { deletedAt: null } as any,
        });
        break;
    }

    console.log(`[SoftDelete] ${table}:${id} restored by ${restoredBy || 'system'}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SoftDelete] Failed to restore ${table}:${id}`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Permanently delete entity (use with caution!)
 * Requires entity to be soft-deleted first (safety check)
 */
export async function hardDelete(
  table: SoftDeleteTable,
  id: string,
  force: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Safety check: must be soft-deleted first unless forced
    if (!force) {
      const entity = await getEntity(table, id);
      if (!entity) {
        return { success: false, error: 'Entity not found' };
      }
      if (!(entity as any).deletedAt) {
        return { 
          success: false, 
          error: 'Entity must be soft-deleted before hard delete. Use force=true to override.' 
        };
      }
    }

    switch (table) {
      case 'project':
        await db.project.delete({ where: { id } });
        break;
      case 'comment':
        await db.comment.delete({ where: { id } });
        break;
      case 'rating':
        await db.rating.delete({ where: { id } });
        break;
      case 'creator':
        await db.creator.delete({ where: { id } });
        break;
    }

    console.log(`[HardDelete] ${table}:${id} permanently deleted`);
    return { success: true };
  } catch (error: any) {
    console.error(`[HardDelete] Failed to delete ${table}:${id}`, error);
    return { success: false, error: error.message };
  }
}

async function getEntity(table: SoftDeleteTable, id: string) {
  switch (table) {
    case 'project':
      return db.project.findUnique({ where: { id } });
    case 'comment':
      return db.comment.findUnique({ where: { id } });
    case 'rating':
      return db.rating.findUnique({ where: { id } });
    case 'creator':
      return db.creator.findUnique({ where: { id } });
  }
}

// ============================================================================
// DELETION CONFIRMATION TOKENS
// ============================================================================

const confirmationTokens = new Map<string, {
  table: SoftDeleteTable;
  entityId: string;
  userId: string;
  expiresAt: number;
}>();

/**
 * Generate a confirmation token for destructive operations
 * Token expires after 5 minutes
 */
export function generateDeleteConfirmation(
  table: SoftDeleteTable,
  entityId: string,
  userId: string
): string {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  confirmationTokens.set(token, {
    table,
    entityId,
    userId,
    expiresAt,
  });

  // Cleanup old tokens
  for (const [key, value] of confirmationTokens.entries()) {
    if (value.expiresAt < Date.now()) {
      confirmationTokens.delete(key);
    }
  }

  return token;
}

/**
 * Validate and consume a deletion confirmation token
 */
export function validateDeleteConfirmation(
  token: string,
  userId: string
): { valid: boolean; table?: SoftDeleteTable; entityId?: string; error?: string } {
  const confirmation = confirmationTokens.get(token);
  
  if (!confirmation) {
    return { valid: false, error: 'Invalid or expired confirmation token' };
  }

  if (confirmation.expiresAt < Date.now()) {
    confirmationTokens.delete(token);
    return { valid: false, error: 'Confirmation token has expired' };
  }

  if (confirmation.userId !== userId) {
    return { valid: false, error: 'Token does not belong to this user' };
  }

  // Consume the token (one-time use)
  confirmationTokens.delete(token);

  return {
    valid: true,
    table: confirmation.table,
    entityId: confirmation.entityId,
  };
}

// ============================================================================
// CASCADE SOFT DELETE
// ============================================================================

/**
 * Soft delete project and all related entities
 */
export async function cascadeSoftDeleteProject(
  projectId: string,
  deletedBy: string
): Promise<{ success: boolean; affected: Record<string, number> }> {
  const affected: Record<string, number> = {};

  try {
    // Soft delete all comments
    const comments = await db.comment.updateMany({
      where: { 
        projectId,
        deletedAt: null,
      } as any,
      data: { deletedAt: new Date() } as any,
    });
    affected.comments = comments.count;

    // Soft delete all ratings
    const ratings = await db.rating.updateMany({
      where: { 
        projectId,
        deletedAt: null,
      } as any,
      data: { deletedAt: new Date() } as any,
    });
    affected.ratings = ratings.count;

    // Soft delete the project
    await softDelete('project', projectId, deletedBy);
    affected.projects = 1;

    return { success: true, affected };
  } catch (error: any) {
    console.error(`[CascadeDelete] Failed for project ${projectId}`, error);
    return { success: false, affected };
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Standard where clause to exclude soft-deleted records
 */
export const notDeleted = {
  deletedAt: null,
};

/**
 * Standard where clause to only include soft-deleted records
 */
export const onlyDeleted = {
  deletedAt: { not: null },
};

/**
 * Include all records regardless of deletion status
 */
export const includeDeleted = {};
