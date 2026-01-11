import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  techStack: z.array(z.string()).min(1),
  category: z.string().min(1),
  previewImages: z.array(z.string().url()).optional().default([]),
  externalLink: z.string().url(),
  isPublic: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  techStack: z.array(z.string()).min(1).optional(),
  category: z.string().min(1).optional(),
  previewImages: z.array(z.string().url()).optional(),
  externalLink: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export const contactMessageSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  socialLinks: z.record(z.string().url()).optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export type RatingDto = z.infer<typeof ratingSchema>;
export type ContactMessageDto = z.infer<typeof contactMessageSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateContactDto = z.infer<typeof updateContactSchema>;
