import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { verifyToken } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return unauthorized();
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return unauthorized();
    }

    // Parse query params for filtering and pagination
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const creatorId = searchParams.get('creator') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'public') {
      where.isPublic = true;
    } else if (status === 'private') {
      where.isPublic = false;
    }

    if (category) {
      where.category = category;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    // Get total count
    const total = await db.project.count({ where });

    // Get paginated projects
    const projects = await db.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get unique categories for filter options
    const categories = await db.project.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    // Get creators for filter options
    const creators = await db.creator.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return success({
      data: projects,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
      filterOptions: {
        categories: categories.map((c) => c.category).filter(Boolean),
        creators: creators,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/projects error:', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return unauthorized();
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return unauthorized();
    }

    const data = await request.json();

    const project = await projectService.createProject({
      title: data.title,
      description: data.description,
      techStack: data.techStack || [],
      category: data.category,
      previewImages: data.previewImages || [],
      externalLink: data.externalLink || '',
      creatorId: data.creatorId,
      isPublic: data.isPublic ?? false,
    });

    return success({ project }, 201);
  } catch (err) {
    console.error('POST /api/admin/projects error:', err);
    return serverError();
  }
}
