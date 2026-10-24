import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secreto_local_para_desarrollo_123_cambiar_en_produccion';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function authenticateSeller(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Token no proporcionado' };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return { user: null, error: 'Token inválido o expirado' };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId, isActive: true },
  });

  if (!user) {
    return { user: null, error: 'Usuario no encontrado o inactivo' };
  }

  return { user, error: null };
}