import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getClientIP, hashIP } from '../utils/ipHash';

const prisma = new PrismaClient();

export const createRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, feedback } = req.body;
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);

    // Check if user already rated recently (within 24 hours)
    const recentRating = await prisma.rating.findFirst({
      where: {
        ipHash,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentRating) {
      return res.status(429).json({
        success: false,
        error: 'You can only submit one rating per day',
      });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        feedback: feedback || null,
        ipHash,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newRating.id,
        rating: newRating.rating,
        createdAt: newRating.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
