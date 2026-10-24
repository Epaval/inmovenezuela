import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar código
    if (user.emailVerificationCode !== code) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Verificar expiración
    if (user.emailVerificationExpiresAt && new Date() > user.emailVerificationExpiresAt) {
      return NextResponse.json({ error: 'El código ha expirado' }, { status: 400 });
    }

    // Encriptar nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña y limpiar código
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ 
      message: 'Contraseña cambiada exitosamente' 
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}