import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Validar datos de entrada
    const data = registerSchema.parse(body);

    // 2. Verificar si el email o username ya existen
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'El email o el nombre de usuario ya están registrados' },
        { status: 409 }
      );
    }

    // 3. Hashear la contraseña
    const passwordHash = await hashPassword(data.password);

    // 4. Crear el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });

    // 5. Generar token JWT
    const token = generateToken(user.id);

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}