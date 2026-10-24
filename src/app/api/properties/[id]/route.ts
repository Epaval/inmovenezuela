import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateSeller } from '@/lib/auth';
import { propertySchema } from '@/lib/validations';
import { ZodError } from 'zod';

type Params = { params: Promise<{ id: string }> };

// GET /api/properties/[id] - Público (Ver detalle)
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        seller: { select: { fullName: true, phone: true, email: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error GET property by ID:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT /api/properties/[id] - Actualizar propiedad (marcar como vendida, editar, etc.)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const existing = await prisma.property.findUnique({ where: { id } });
    
    if (!existing) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }
    
    if (existing.sellerId !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error PUT property:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE /api/properties/[id] - Solo el dueño puede eliminar
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { user, error } = await authenticateSeller(request);
    if (!user) return NextResponse.json({ error }, { status: 401 });

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    if (existing.sellerId !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar esta propiedad' }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ message: 'Propiedad eliminada correctamente' });
  } catch (error) {
    console.error('Error DELETE property:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}