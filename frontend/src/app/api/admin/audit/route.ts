/**
 * Admin API: Audit Logs
 * 
 * GET /api/admin/audit - Get paginated audit logs
 */

import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/server/auth';
import { auditService, AuditAction, EntityType, ActorType } from '@/lib/server/audit';
import { success, unauthorized, serverError, parsePaginationParams } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return unauthorized('Admin authentication required');
    }

    const { searchParams } = request.nextUrl;
    const pagination = parsePaginationParams(searchParams);
    
    // Parse filters
    const actorId = searchParams.get('actorId') || undefined;
    const actorType = searchParams.get('actorType') as ActorType | undefined;
    const action = searchParams.get('action') as AuditAction | undefined;
    const entityType = searchParams.get('entityType') as EntityType | undefined;
    const entityId = searchParams.get('entityId') || undefined;
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await auditService.getLogs({
      page: pagination.page,
      limit: pagination.limit,
      actorId,
      actorType,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
    });

    return success(result);
  } catch (err) {
    console.error('GET /api/admin/audit error:', err);
    return serverError();
  }
}
