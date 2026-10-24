import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateSeller } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';

// GET: Listar todos los agentes (solo ADMIN)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
    }

    // ✅ Obtener TODOS los usuarios con rol SELLER
    const agents = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Total de agentes encontrados: ${agents.length}`);

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error GET agents:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST: Crear nuevo agente (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
    }

    const body = await request.json();
    const { email, username, fullName, phone } = body;

    // Validar campos requeridos
    if (!email || !username || !fullName) {
      return NextResponse.json({ error: 'Email, username y nombre completo son requeridos' }, { status: 400 });
    }

    // Verificar si el email o username ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email o username ya está en uso' }, { status: 400 });
    }

    // Generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear contraseña temporal (el agente la cambiará después)
    const tempPassword = 'temp123456';
    const passwordHash = await bcrypt.hash(tempPassword, 12);

        // Crear el agente
    const agent = await prisma.user.create({
      data: {
        email,
        username,
        fullName,
        phone: phone || null,
        role: 'SELLER',
        isActive: false,
        emailVerified: false,
        mustChangePassword: true, // ✅ Forzar cambio de contraseña
        passwordHash,
        emailVerificationCode: verificationCode,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    // Enviar correo de verificación (simulado)
    await sendVerificationEmail(email, verificationCode, fullName, tempPassword);

    return NextResponse.json({
      message: 'Agente creado exitosamente. Código de verificación enviado.',
      agent: {
        id: agent.id,
        email: agent.email,
        fullName: agent.fullName,
      },
      // En producción, no enviaríamos el código en la respuesta
      verificationCode,
    });
  } catch (error) {
    console.error('Error POST agent:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}