/**
 * Audit Log Service
 * 
 * Enterprise-grade audit logging for tracking all significant actions.
 * Critical for compliance, debugging, and security monitoring.
 * 
 * NOTE: Run `npx prisma generate` after adding AuditLog to schema
 * to enable the db.auditLog client.
 */

import { db } from './db';

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILED = 'auth.login.failed',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGED = 'auth.password.changed',
  
  // Project lifecycle
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',
  PROJECT_PUBLISHED = 'project.published',
  PROJECT_UNPUBLISHED = 'project.unpublished',
  PROJECT_VIEWED = 'project.viewed',
  
  // Creator management
  CREATOR_REGISTERED = 'creator.registered',
  CREATOR_UPDATED = 'creator.updated',
  CREATOR_DEACTIVATED = 'creator.deactivated',
  CREATOR_REACTIVATED = 'creator.reactivated',
  CREATOR_DELETED = 'creator.deleted',
  
  // Collaboration
  COLLAB_INVITE_SENT = 'collab.invite.sent',
  COLLAB_INVITE_ACCEPTED = 'collab.invite.accepted',
  COLLAB_INVITE_REJECTED = 'collab.invite.rejected',
  COLLAB_MEMBER_REMOVED = 'collab.member.removed',
  
  // Comments & Ratings
  COMMENT_CREATED = 'comment.created',
  COMMENT_DELETED = 'comment.deleted',
  RATING_SUBMITTED = 'rating.submitted',
  
  // Admin actions
  ADMIN_ACTION = 'admin.action',
  ADMIN_BULK_DELETE = 'admin.bulk.delete',
  ADMIN_SETTINGS_CHANGED = 'admin.settings.changed',
  
  // Security events
  PERMISSION_DENIED = 'security.permission.denied',
  RATE_LIMIT_EXCEEDED = 'security.ratelimit.exceeded',
  SUSPICIOUS_ACTIVITY = 'security.suspicious',
}

export enum EntityType {
  PROJECT = 'project',
  CREATOR = 'creator',
  ADMIN = 'admin',
  COMMENT = 'comment',
  RATING = 'rating',
  COLLABORATION = 'collaboration',
  CONTACT = 'contact',
  SYSTEM = 'system',
}

export enum ActorType {
  VISITOR = 'visitor',
  CREATOR = 'creator',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export interface AuditLogEntry {
  actorId?: string;
  actorType: ActorType;
  actorEmail?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogRecord extends AuditLogEntry {
  id: string;
  timestamp: Date;
}

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

export const auditService = {
  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          actorId: entry.actorId,
          actorType: entry.actorType,
          actorEmail: entry.actorEmail,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      // Audit logging should never break the main flow
      // Log to console for debugging but don't throw
      console.error('Audit log failed:', error);
    }
  },

  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(options: {
    page?: number;
    limit?: number;
    actorId?: string;
    actorType?: ActorType;
    action?: AuditAction;
    entityType?: EntityType;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const {
      page = 1,
      limit = 50,
      actorId,
      actorType,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
    } = options;

    const where: any = {};

    if (actorId) where.actorId = actorId;
    if (actorType) where.actorType = actorType;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get recent activity for a specific entity
   */
  async getEntityHistory(entityType: EntityType, entityId: string, limit = 20) {
    const logs = await db.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  },

  /**
   * Get user activity history
   */
  async getUserActivity(actorId: string, limit = 50) {
    const logs = await db.auditLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  },

  /**
   * Get security-related events
   */
  async getSecurityEvents(startDate?: Date, limit = 100) {
    const securityActions = [
      AuditAction.LOGIN_FAILED,
      AuditAction.PERMISSION_DENIED,
      AuditAction.RATE_LIMIT_EXCEEDED,
      AuditAction.SUSPICIOUS_ACTIVITY,
    ];

    const where: any = {
      action: { in: securityActions },
    };

    if (startDate) {
      where.timestamp = { gte: startDate };
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  },

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanup(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    return { deletedCount: result.count };
  },
};

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

/**
 * Extract IP and user agent from request for audit logging
 */
export function extractRequestMetadata(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

/**
 * Create a pre-configured audit logger for a specific actor
 */
export function createAuditLogger(actor: {
  id?: string;
  type: ActorType;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  return {
    log: (
      action: AuditAction,
      entityType: EntityType,
      entityId?: string,
      metadata?: Record<string, any>
    ) => {
      return auditService.log({
        actorId: actor.id,
        actorType: actor.type,
        actorEmail: actor.email,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      });
    },
  };
}
