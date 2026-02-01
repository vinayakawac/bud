import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}

export function forbidden(message = 'Forbidden: Insufficient permissions') {
  return error(message, 403);
}

export function notFound(message = 'Not found') {
  return error(message, 404);
}

export function rateLimited(message = 'Too many requests. Please try again later.') {
  return error(message, 429);
}

export function serverError(message = 'Internal server error') {
  return error(message, 500);
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    sort: searchParams.get('sort') || 'createdAt',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  };
}

export function paginatedSuccess<T>(
  data: T[], 
  total: number, 
  params: PaginationParams
) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
