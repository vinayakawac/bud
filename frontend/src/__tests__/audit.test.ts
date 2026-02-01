/**
 * Audit Log Tests
 * 
 * Tests for the audit logging system.
 */

import { describe, it, expect } from 'vitest';
import { 
  AuditAction, 
  EntityType, 
  ActorType,
  extractRequestMetadata,
} from '@/lib/server/audit';

describe('Audit Log Types', () => {
  describe('AuditAction Enum', () => {
    it('should have authentication actions', () => {
      expect(AuditAction.LOGIN_SUCCESS).toBe('auth.login.success');
      expect(AuditAction.LOGIN_FAILED).toBe('auth.login.failed');
      expect(AuditAction.LOGOUT).toBe('auth.logout');
    });

    it('should have project lifecycle actions', () => {
      expect(AuditAction.PROJECT_CREATED).toBe('project.created');
      expect(AuditAction.PROJECT_UPDATED).toBe('project.updated');
      expect(AuditAction.PROJECT_DELETED).toBe('project.deleted');
      expect(AuditAction.PROJECT_PUBLISHED).toBe('project.published');
    });

    it('should have security actions', () => {
      expect(AuditAction.PERMISSION_DENIED).toBe('security.permission.denied');
      expect(AuditAction.RATE_LIMIT_EXCEEDED).toBe('security.ratelimit.exceeded');
    });
  });

  describe('EntityType Enum', () => {
    it('should have all entity types', () => {
      expect(EntityType.PROJECT).toBe('project');
      expect(EntityType.CREATOR).toBe('creator');
      expect(EntityType.ADMIN).toBe('admin');
      expect(EntityType.COMMENT).toBe('comment');
      expect(EntityType.RATING).toBe('rating');
      expect(EntityType.SYSTEM).toBe('system');
    });
  });

  describe('ActorType Enum', () => {
    it('should have all actor types', () => {
      expect(ActorType.VISITOR).toBe('visitor');
      expect(ActorType.CREATOR).toBe('creator');
      expect(ActorType.ADMIN).toBe('admin');
      expect(ActorType.SYSTEM).toBe('system');
    });
  });
});

describe('Audit Log Utilities', () => {
  describe('extractRequestMetadata', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            if (name === 'user-agent') return 'Mozilla/5.0';
            return null;
          },
        },
      } as unknown as Request;

      const metadata = extractRequestMetadata(mockRequest);
      
      expect(metadata.ipAddress).toBe('192.168.1.1');
      expect(metadata.userAgent).toBe('Mozilla/5.0');
    });

    it('should handle missing headers gracefully', () => {
      const mockRequest = {
        headers: {
          get: () => null,
        },
      } as unknown as Request;

      const metadata = extractRequestMetadata(mockRequest);
      
      expect(metadata.ipAddress).toBe('unknown');
      expect(metadata.userAgent).toBe('unknown');
    });
  });
});

describe('Audit Log Entry Structure', () => {
  it('should accept valid audit log entry', () => {
    interface AuditLogEntry {
      actorId?: string;
      actorType: ActorType;
      action: AuditAction;
      entityType: EntityType;
      entityId?: string;
      metadata?: Record<string, any>;
    }

    const validEntry: AuditLogEntry = {
      actorId: 'user-123',
      actorType: ActorType.CREATOR,
      action: AuditAction.PROJECT_CREATED,
      entityType: EntityType.PROJECT,
      entityId: 'project-456',
      metadata: { title: 'New Project' },
    };

    // Type check passes if this compiles
    expect(validEntry.actorType).toBe(ActorType.CREATOR);
    expect(validEntry.action).toBe(AuditAction.PROJECT_CREATED);
  });

  it('should allow anonymous actions', () => {
    interface AuditLogEntry {
      actorId?: string;
      actorType: ActorType;
      action: AuditAction;
      entityType: EntityType;
    }

    const anonymousEntry: AuditLogEntry = {
      actorType: ActorType.VISITOR,
      action: AuditAction.PROJECT_VIEWED,
      entityType: EntityType.PROJECT,
    };

    expect(anonymousEntry.actorId).toBeUndefined();
    expect(anonymousEntry.actorType).toBe(ActorType.VISITOR);
  });
});
