import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRatings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ratings = await prisma.rating.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: ratings.length,
      average:
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0,
      distribution: {
        1: ratings.filter((r) => r.rating === 1).length,
        2: ratings.filter((r) => r.rating === 2).length,
        3: ratings.filter((r) => r.rating === 3).length,
        4: ratings.filter((r) => r.rating === 4).length,
        5: ratings.filter((r) => r.rating === 5).length,
      },
    };

    res.json({
      success: true,
      data: ratings,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const rating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found',
      });
    }

    await prisma.rating.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
