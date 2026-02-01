/**
 * Role-Based Access Control (RBAC) System
 * 
 * Provides explicit role management and authorization guards.
 * Enterprise-grade access control pattern.
 */

import { NextRequest, NextResponse } from 'next/server';
import { unauthorized, error } from './response';
import { authenticateAdmin } from './auth';
import { creatorAuth } from '@/domain/creator/auth';

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export enum Role {
  VISITOR = 'visitor',      // Unauthenticated public users
  CREATOR = 'creator',      // Registered creators who own/manage projects
  ADMIN = 'admin',          // Platform administrators
  SUPER_ADMIN = 'super_admin', // Reserved for future: full system access
}

export enum Permission {
  // Project permissions
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_PUBLISH = 'project:publish',
  
  // Creator permissions
  CREATOR_VIEW = 'creator:view',
  CREATOR_UPDATE = 'creator:update',
  CREATOR_DELETE = 'creator:delete',
  
  // Admin permissions
  ADMIN_VIEW = 'admin:view',
  ADMIN_MANAGE = 'admin:manage',
  ADMIN_ANALYTICS = 'admin:analytics',
  
  // Comment permissions
  COMMENT_CREATE = 'comment:create',
  COMMENT_DELETE = 'comment:delete',
  COMMENT_MODERATE = 'comment:moderate',
  
  // Rating permissions
  RATING_CREATE = 'rating:create',
  RATING_VIEW = 'rating:view',
  
  // Collaboration permissions
  COLLAB_INVITE = 'collab:invite',
  COLLAB_MANAGE = 'collab:manage',
  
  // Audit permissions
  AUDIT_VIEW = 'audit:view',
}

// ============================================================================
// ROLE-PERMISSION MAPPING
// ============================================================================

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.VISITOR]: [
    Permission.PROJECT_VIEW,
    Permission.CREATOR_VIEW,
    Permission.COMMENT_CREATE,
    Permission.RATING_CREATE,
    Permission.RATING_VIEW,
  ],
  
  [Role.CREATOR]: [
    // Inherits visitor permissions
    Permission.PROJECT_VIEW,
    Permission.CREATOR_VIEW,
    Permission.COMMENT_CREATE,
    Permission.RATING_CREATE,
    Permission.RATING_VIEW,
    // Creator-specific permissions
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_PUBLISH,
    Permission.CREATOR_UPDATE,
    Permission.COLLAB_INVITE,
    Permission.COLLAB_MANAGE,
  ],
  
  [Role.ADMIN]: [
    // Full access to most operations
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_PUBLISH,
    Permission.CREATOR_VIEW,
    Permission.CREATOR_UPDATE,
    Permission.CREATOR_DELETE,
    Permission.ADMIN_VIEW,
    Permission.ADMIN_ANALYTICS,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_DELETE,
    Permission.COMMENT_MODERATE,
    Permission.RATING_CREATE,
    Permission.RATING_VIEW,
    Permission.COLLAB_INVITE,
    Permission.COLLAB_MANAGE,
    Permission.AUDIT_VIEW,
  ],
  
  [Role.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
};

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

export interface AuthContext {
  role: Role;
  userId?: string;
  email?: string;
  isAuthenticated: boolean;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = RolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has ALL specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Get auth context from request
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  // Try admin auth first
  const adminPayload = await authenticateAdmin(request);
  if (adminPayload) {
    return {
      role: adminPayload.role === 'super_admin' ? Role.SUPER_ADMIN : Role.ADMIN,
      userId: adminPayload.adminId,
      email: adminPayload.email,
      isAuthenticated: true,
    };
  }
  
  // Try creator auth
  const creatorPayload = await creatorAuth.authenticate(request);
  if (creatorPayload) {
    return {
      role: Role.CREATOR,
      userId: creatorPayload.creatorId,
      email: creatorPayload.email,
      isAuthenticated: true,
    };
  }
  
  // Default to visitor
  return {
    role: Role.VISITOR,
    isAuthenticated: false,
  };
}

// ============================================================================
// ROUTE GUARDS (Higher-Order Functions)
// ============================================================================

export type RouteHandler = (
  request: NextRequest,
  context: AuthContext,
  params?: any
) => Promise<NextResponse>;

/**
 * Guard: Require specific role(s)
 */
export function requireRole(...roles: Role[]) {
  return (handler: RouteHandler): ((request: NextRequest, context?: any) => Promise<NextResponse>) => {
    return async (request: NextRequest, routeContext?: any) => {
      const authContext = await getAuthContext(request);
      
      if (!roles.includes(authContext.role)) {
        return unauthorized(`Access denied. Required role: ${roles.join(' or ')}`);
      }
      
      return handler(request, authContext, routeContext?.params);
    };
  };
}

/**
 * Guard: Require specific permission(s)
 */
export function requirePermission(...permissions: Permission[]) {
  return (handler: RouteHandler): ((request: NextRequest, context?: any) => Promise<NextResponse>) => {
    return async (request: NextRequest, routeContext?: any) => {
      const authContext = await getAuthContext(request);
      
      if (!hasAllPermissions(authContext.role, permissions)) {
        return error('Forbidden: Insufficient permissions', 403);
      }
      
      return handler(request, authContext, routeContext?.params);
    };
  };
}

/**
 * Guard: Require authentication (any role except visitor)
 */
export function requireAuth(handler: RouteHandler): (request: NextRequest, context?: any) => Promise<NextResponse> {
  return async (request: NextRequest, routeContext?: any) => {
    const authContext = await getAuthContext(request);
    
    if (!authContext.isAuthenticated) {
      return unauthorized('Authentication required');
    }
    
    return handler(request, authContext, routeContext?.params);
  };
}

/**
 * Guard: Require resource ownership OR admin role
 */
export function requireOwnershipOrAdmin(
  getResourceOwnerId: (request: NextRequest, params?: any) => Promise<string | null>
) {
  return (handler: RouteHandler): ((request: NextRequest, context?: any) => Promise<NextResponse>) => {
    return async (request: NextRequest, routeContext?: any) => {
      const authContext = await getAuthContext(request);
      
      if (!authContext.isAuthenticated) {
        return unauthorized('Authentication required');
      }
      
      // Admins bypass ownership check
      if (authContext.role === Role.ADMIN || authContext.role === Role.SUPER_ADMIN) {
        return handler(request, authContext, routeContext?.params);
      }
      
      // Check ownership for non-admins
      const ownerId = await getResourceOwnerId(request, routeContext?.params);
      
      if (!ownerId || ownerId !== authContext.userId) {
        return error('Forbidden: You do not own this resource', 403);
      }
      
      return handler(request, authContext, routeContext?.params);
    };
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get human-readable role name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [Role.VISITOR]: 'Visitor',
    [Role.CREATOR]: 'Creator',
    [Role.ADMIN]: 'Administrator',
    [Role.SUPER_ADMIN]: 'Super Administrator',
  };
  return displayNames[role] || 'Unknown';
}

/**
 * Validate role string
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}
