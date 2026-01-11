import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Convert arrays/objects to JSON strings for SQLite
    const projectData = {
      ...req.body,
      techStack: JSON.stringify(req.body.techStack),
      previewImages: JSON.stringify(req.body.previewImages),
      metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
    };

    const project = await prisma.project.create({
      data: projectData,
    });

    // Parse back to objects/arrays for response
    const parsedProject = {
      ...project,
      techStack: JSON.parse(project.techStack),
      previewImages: JSON.parse(project.previewImages),
      metadata: project.metadata ? JSON.parse(project.metadata) : null,
    };

    res.status(201).json({
      success: true,
      data: parsedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Convert arrays/objects to JSON strings for SQLite
    const updateData: any = { ...req.body };
    if (updateData.techStack) {
      updateData.techStack = JSON.stringify(updateData.techStack);
    }
    if (updateData.previewImages) {
      updateData.previewImages = JSON.stringify(updateData.previewImages);
    }
    if (updateData.metadata) {
      updateData.metadata = JSON.stringify(updateData.metadata);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Parse back to objects/arrays for response
    const parsedProject = {
      ...updatedProject,
      techStack: JSON.parse(updatedProject.techStack),
      previewImages: JSON.parse(updatedProject.previewImages),
      metadata: updatedProject.metadata ? JSON.parse(updatedProject.metadata) : null,
    };

    res.json({
      success: true,
      data: parsedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
