import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getClientIP, hashIP } from '../utils/ipHash';

const prisma = new PrismaClient();

export const getContactInfo = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!contact) {
      return res.json({
        success: true,
        data: {
          email: '',
          phone: '',
          socialLinks: {},
        },
      });
    }

    return res.json({
      success: true,
      data: {
        email: contact.email,
        phone: contact.phone,
        socialLinks: JSON.parse(contact.socialLinks),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, message } = req.body;
    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        ipHash,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: contactMessage.id,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
