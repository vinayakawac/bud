/**
 * API Middleware Stack
 * 
 * Composes validation, rate limiting, auth, and error handling
 * into a unified middleware for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSchema, ValidationSchema, validationError } from './validation';
import { withRateLimit, rateLimitConfigs, RateLimitConfig } from './rateLimit';
import { 
  getAuthContext, 
  requireRole, 
  requirePermission,
  Role, 
  Permission 
} from './rbac';
import { auditService, AuditAction } from './audit';
import { 
  checkIdempotency, 
  completeIdempotentRequest,
  generateIdempotencyKey 
} from './concurrency';
import { 
  success, 
  badRequest, 
  unauthorized, 
  forbidden, 
  serverError, 
  rateLimited 
} from './response';

// ============================================================================
// TYPES
// ============================================================================

interface MiddlewareOptions {
  // Rate limiting
  rateLimit?: RateLimitConfig | keyof typeof rateLimitConfigs;
  
  // Authentication
  auth?: {
    required?: boolean;
    role?: Role;
    permission?: Permission;
  };
  
  // Validation
  schema?: ValidationSchema<Record<string, unknown>>;
  
  // Idempotency
  idempotent?: boolean;
  
  // Audit
  audit?: {
    action: AuditAction;
    entityType: string;
    getEntityId?: (body: any, result: any) => string;
  };
}

type Handler<T = any> = (
  request: NextRequest,
  context: HandlerContext
) => Promise<T>;

interface HandlerContext {
  body: any;
  params: Record<string, string>;
  auth: {
    id: string;
    type: 'creator' | 'admin' | 'visitor';
    email?: string;
  } | null;
  ip: string;
}

// ============================================================================
// MIDDLEWARE WRAPPER
// ============================================================================

/**
 * Create a hardened API handler with middleware stack
 * 
 * @example
 * ```ts
 * export const POST = createHandler(
 *   async (req, { body, auth }) => {
 *     const project = await projectService.create(body, auth.id);
 *     return project;
 *   },
 *   {
 *     rateLimit: 'write',
 *     auth: { required: true, role: Role.CREATOR },
 *     schema: schemas.createProject,
 *     idempotent: true,
 *     audit: { action: AuditAction.PROJECT_CREATED, entityType: 'project' }
 *   }
 * );
 * ```
 */
export function createHandler<T>(
  handler: Handler<T>,
  options: MiddlewareOptions = {}
) {
  return async (
    request: NextRequest,
    { params }: { params?: Record<string, string> } = {}
  ): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    try {
      // 1. Rate Limiting
      if (options.rateLimit) {
        const config = typeof options.rateLimit === 'string' 
          ? rateLimitConfigs[options.rateLimit]
          : options.rateLimit;
          
        const rateLimitCheck = await withRateLimit(
          request,
          config,
          async () => null // Just check, don't execute yet
        );
        
        if (!rateLimitCheck.allowed) {
          return rateLimited(rateLimitCheck.retryAfter);
        }
      }

      // 2. Authentication
      let auth: HandlerContext['auth'] = null;
      
      if (options.auth?.required || options.auth?.role || options.auth?.permission) {
        const authContext = await getAuthContext(request);
        
        if (!authContext.authenticated) {
          return unauthorized('Authentication required');
        }
        
        auth = {
          id: authContext.user!.id,
          type: authContext.role as any,
          email: authContext.user?.email,
        };

        // Role check
        if (options.auth.role) {
          const roleCheck = await requireRole(request, options.auth.role);
          if (!roleCheck.authorized) {
            return forbidden(roleCheck.message);
          }
        }

        // Permission check
        if (options.auth.permission) {
          const permCheck = await requirePermission(request, options.auth.permission);
          if (!permCheck.authorized) {
            return forbidden(permCheck.message);
          }
        }
      }

      // 3. Parse Body
      let body: any = null;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          body = await request.json();
        } catch {
          return badRequest('Invalid JSON body');
        }
      }

      // 4. Validation
      if (options.schema && body) {
        const validation = validateSchema(options.schema, body);
        if (!validation.valid) {
          return validationError(validation.errors);
        }
        body = validation.data; // Use sanitized data
      }

      // 5. Idempotency Check
      let idempotencyKey: string | null = null;
      if (options.idempotent && auth) {
        idempotencyKey = request.headers.get('idempotency-key') 
          || generateIdempotencyKey(auth.id, request.url, body || {});
          
        const cached = checkIdempotency(idempotencyKey);
        
        if (cached.cached) {
          if (cached.status === 'pending') {
            return NextResponse.json(
              { success: false, error: 'Request already in progress' },
              { status: 409 }
            );
          }
          return success(cached.data);
        }
      }

      // 6. Execute Handler
      const context: HandlerContext = {
        body,
        params: params || {},
        auth,
        ip,
      };

      const result = await handler(request, context);

      // 7. Complete Idempotency
      if (idempotencyKey) {
        completeIdempotentRequest(idempotencyKey, result, true);
      }

      // 8. Audit Log
      if (options.audit && auth) {
        const entityId = options.audit.getEntityId?.(body, result) || (result as any)?.id;
        
        await auditService.log({
          action: options.audit.action,
          actorId: auth.id,
          actorType: auth.type,
          actorEmail: auth.email,
          entityType: options.audit.entityType,
          entityId,
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || undefined,
        }).catch(console.error); // Don't fail request on audit error
      }

      // 9. Return Success
      return success(result);

    } catch (error: any) {
      console.error('[API Error]', {
        url: request.url,
        method: request.method,
        error: error.message,
        stack: error.stack,
      });

      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return badRequest('A record with this value already exists');
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        );
      }

      return serverError(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred'
      );
    }
  };
}

// ============================================================================
// SPECIALIZED HANDLERS
// ============================================================================

/**
 * Public read handler (no auth, standard rate limiting)
 */
export function publicHandler<T>(handler: Handler<T>) {
  return createHandler(handler, {
    rateLimit: 'publicRead',
  });
}

/**
 * Protected write handler (auth required, write rate limiting)
 */
export function protectedHandler<T>(
  handler: Handler<T>,
  options: Omit<MiddlewareOptions, 'auth' | 'rateLimit'> & {
    role?: Role;
    permission?: Permission;
  } = {}
) {
  return createHandler(handler, {
    rateLimit: 'write',
    auth: {
      required: true,
      role: options.role,
      permission: options.permission,
    },
    ...options,
  });
}

/**
 * Admin-only handler
 */
export function adminHandler<T>(
  handler: Handler<T>,
  options: Omit<MiddlewareOptions, 'auth' | 'rateLimit'> = {}
) {
  return createHandler(handler, {
    rateLimit: 'sensitive',
    auth: {
      required: true,
      role: Role.ADMIN,
    },
    ...options,
  });
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// In your API route file:

import { createHandler, protectedHandler } from '@/lib/server/apiMiddleware';
import { schemas } from '@/lib/server/validation';
import { Role, Permission } from '@/lib/server/rbac';
import { AuditAction } from '@/lib/server/audit';

// Simple protected route
export const GET = protectedHandler(async (req, { auth, params }) => {
  const projects = await projectService.getByCreator(auth.id);
  return projects;
});

// Fully configured route
export const POST = createHandler(
  async (req, { body, auth }) => {
    const project = await projectService.create({
      ...body,
      creatorId: auth.id,
    });
    return project;
  },
  {
    rateLimit: 'write',
    auth: { 
      required: true, 
      role: Role.CREATOR,
      permission: Permission.CREATE_PROJECT,
    },
    schema: schemas.createProject,
    idempotent: true,
    audit: { 
      action: AuditAction.PROJECT_CREATED, 
      entityType: 'project',
      getEntityId: (body, result) => result.id,
    },
  }
);
*/
