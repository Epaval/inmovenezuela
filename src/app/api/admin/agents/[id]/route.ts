import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateSeller } from '@/lib/auth';

// PUT: Editar agente (solo ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { fullName, phone, isActive } = body;

    const agent = await prisma.user.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName || agent.fullName,
        phone: phone !== undefined ? phone : agent.phone,
        isActive: isActive !== undefined ? isActive : agent.isActive,
      },
    });

    return NextResponse.json({
      message: 'Agente actualizado exitosamente',
      agent: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error('Error PUT agent:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar agente (solo ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
    }

    const { id } = await params;

    const agent = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });
    }

    // No permitir eliminar si tiene propiedades
    if (agent._count.properties > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el agente porque tiene propiedades asociadas' 
      }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Agente eliminado exitosamente' });
  } catch (error) {
    console.error('Error DELETE agent:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}