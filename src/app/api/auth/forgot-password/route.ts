import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo es requerido' }, { status: 400 });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return NextResponse.json({ 
        message: 'Si el correo existe, se ha enviado un código de recuperación.' 
      });
    }

    // Generar código de recuperación de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

    // Guardar código en la BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: recoveryCode,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    // Enviar correo con el código
    await sendVerificationEmail(
      email,
      recoveryCode,
      user.fullName
    );

    return NextResponse.json({ 
      message: 'Si el correo existe, se ha enviado un código de recuperación.' 
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}