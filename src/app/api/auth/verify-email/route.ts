import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y código son requeridos' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'El email ya fue verificado' }, { status: 400 });
    }

    if (user.emailVerificationCode !== code) {
      return NextResponse.json({ error: 'Código de verificación incorrecto' }, { status: 400 });
    }

    if (user.emailVerificationExpiresAt && new Date() > user.emailVerificationExpiresAt) {
      return NextResponse.json({ error: 'El código de verificación ha expirado' }, { status: 400 });
    }

    // Actualizar usuario: verificar email y activar
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isActive: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.json({ 
      message: 'Email verificado exitosamente. Tu cuenta está activa.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}