import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateContactInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const existingContact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Convert socialLinks to JSON string for SQLite
    const contactData: any = { ...req.body };
    if (contactData.socialLinks) {
      contactData.socialLinks = JSON.stringify(contactData.socialLinks);
    }

    let contact;

    if (existingContact) {
      contact = await prisma.contact.update({
        where: { id: existingContact.id },
        data: contactData,
      });
    } else {
      contact = await prisma.contact.create({
        data: {
          email: contactData.email || '',
          phone: contactData.phone || null,
          socialLinks: contactData.socialLinks || JSON.stringify({}),
        },
      });
    }

    // Parse back for response
    const parsedContact = {
      ...contact,
      socialLinks: JSON.parse(contact.socialLinks),
    };

    res.json({
      success: true,
      data: parsedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalProjects,
      publicProjects,
      totalRatings,
      totalMessages,
      recentProjects,
      recentRatings,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { isPublic: true } }),
      prisma.rating.count(),
      prisma.contactMessage.count(),
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.rating.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const ratings = await prisma.rating.findMany();
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          public: publicProjects,
          recent: recentProjects,
        },
        ratings: {
          total: totalRatings,
          average: averageRating,
          recent: recentRatings,
        },
        messages: {
          total: totalMessages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
