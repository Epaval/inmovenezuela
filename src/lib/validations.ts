import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  fullName: z.string().min(3, 'Nombre completo requerido'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  operationType: z.enum(['SALE', 'RENT', 'BOTH']),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'COMMERCIAL']),
  price: z.number().positive('El precio debe ser mayor a 0'),
  currency: z.string().default('USD'),
  areaM2: z.number().positive('El área debe ser mayor a 0'),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  parkingSpots: z.number().int().min(0).default(0),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
  municipality: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;