import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError, notFound } from '@/lib/server/response';
import { auditService, AuditAction, EntityType, ActorType, extractRequestMetadata } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth) return unauthorized();

    const project = await projectService.getProjectById(params.id);

    if (!project) {
      return notFound('Project not found');
    }

    return success(project);
  } catch (err) {
    console.error('GET /api/admin/projects/[id] error:', err);
    return serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth) return unauthorized();

    const data = await request.json();
    const { ipAddress, userAgent } = extractRequestMetadata(request);

    const project = await projectService.adminUpdateProject(params.id, {
      title: data.title,
      description: data.description,
      techStack: data.techStack || [],
      category: data.category,
      previewImages: data.previewImages || [],
      externalLink: data.externalLink,
    });

    if (!project) {
      return notFound('Project not found');
    }

    // Audit log: Project updated by admin
    await auditService.log({
      actorId: auth.adminId,
      actorType: ActorType.ADMIN,
      actorEmail: auth.email,
      action: AuditAction.PROJECT_UPDATED,
      entityType: EntityType.PROJECT,
      entityId: params.id,
      metadata: { updatedFields: Object.keys(data) },
      ipAddress,
      userAgent,
    });

    return success(project);
  } catch (err) {
    console.error('PUT /api/admin/projects/[id] error:', err);
    return serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth) return unauthorized();

    const { ipAddress, userAgent } = extractRequestMetadata(request);

    // Get project info before deletion for audit
    const project = await projectService.getProjectById(params.id);
    if (!project) {
      return notFound('Project not found');
    }

    const deleted = await projectService.adminDeleteProject(params.id);

    if (!deleted) {
      return serverError('Failed to delete project');
    }

    // Audit log: Project deleted by admin
    await auditService.log({
      actorId: auth.adminId,
      actorType: ActorType.ADMIN,
      actorEmail: auth.email,
      action: AuditAction.PROJECT_DELETED,
      entityType: EntityType.PROJECT,
      entityId: params.id,
      metadata: { 
        projectTitle: project.title,
        projectCreatorId: project.creator?.id,
      },
      ipAddress,
      userAgent,
    });

    return success({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/projects/[id] error:', err);
    return serverError();
  }
}
