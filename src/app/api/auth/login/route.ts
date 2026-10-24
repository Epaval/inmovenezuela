import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // ✅ 1. Verificar si la cuenta está bloqueada temporalmente
    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { 
          error: `Demasiados intentos fallidos. Tu cuenta está bloqueada por ${minutesLeft} minuto(s).`,
          remainingAttempts: 0,
          isLocked: true
        },
        { status: 429 }
      );
    }

    // ✅ 2. Verificar contraseña
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      // Incrementar intentos fallidos
      const newAttempts = user.failedLoginAttempts + 1;
      const remainingAttempts = 3 - newAttempts;
      let lockoutUntil = null;

      // Si llega a 3 intentos, bloquear por 3 minutos
      if (newAttempts >= 3) {
        lockoutUntil = new Date(Date.now() + 3 * 60 * 1000); // 3 minutos
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil: lockoutUntil,
        },
      });

      return NextResponse.json(
        { 
          error: lockoutUntil 
            ? 'Cuenta bloqueada por 3 minutos debido a múltiples intentos fallidos.' 
            : 'Credenciales inválidas',
          remainingAttempts: Math.max(0, remainingAttempts),
          isLocked: lockoutUntil !== null
        },
        { status: 401 }
      );
    }

    // ✅ 3. Login exitoso: Resetear contadores de seguridad
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // 4. Verificaciones de estado de la cuenta
    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Tu correo electrónico no ha sido verificado.' }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' }, { status: 403 });
    }

    // 5. Generar token
    const token = generateToken(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}