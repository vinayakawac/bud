import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, tech, year } = req.query;

    const where: any = { isPublic: true };

    if (category) {
      where.category = category as string;
    }

    if (tech) {
      where.techStack = {
        contains: tech as string,
      };
    }

    if (year) {
      const yearNum = parseInt(year as string, 10);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum + 1, 0, 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        techStack: true,
        category: true,
        previewImages: true,
        externalLink: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse JSON strings back to objects/arrays for SQLite
    const parsedProjects = projects.map(project => ({
      ...project,
      techStack: JSON.parse(project.techStack),
      previewImages: JSON.parse(project.previewImages),
      metadata: project.metadata ? JSON.parse(project.metadata) : null,
    }));

    res.json({
      success: true,
      data: parsedProjects,
      count: parsedProjects.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        isPublic: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Parse JSON strings back to objects/arrays for SQLite
    const parsedProject = {
      ...project,
      techStack: JSON.parse(project.techStack),
      previewImages: JSON.parse(project.previewImages),
      metadata: project.metadata ? JSON.parse(project.metadata) : null,
    };

    return res.json({
      success: true,
      data: parsedProject,
    });
  } catch (error) {
    next(error);
  }
};
