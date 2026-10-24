import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateSeller } from '@/lib/auth';
import { uploadImage } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { image, propertyId, isPrimary } = await request.json();
    if (!image || !propertyId) {
      return NextResponse.json(
        { error: 'La imagen y el ID de la propiedad son requeridos' }, 
        { status: 400 }
      );
    }

    // Verificar que la propiedad existe y pertenece al vendedor
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { sellerId: true }
    });

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    if (property.sellerId !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    // Subir a ImageKit
    const fileName = `prop_${propertyId}_${Date.now()}.jpg`;
    const { url, publicId, fileId } = await uploadImage(image, fileName, `/inmovenezuela/${propertyId}`);

    // Si es imagen primaria, quitar la bandera de las demás
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      });
    }

    // ✅ GUARDAR EN LA BASE DE DATOS
    const propertyImage = await prisma.propertyImage.create({
      data: { 
        url, 
        publicId: fileId,
        propertyId,
        isPrimary: isPrimary || false,
        order: 0, // Puedes ajustar esto para ordenar
      },
    });

    return NextResponse.json(propertyImage, { status: 201 });
  } catch (error) {
    console.error('Error en upload de imagen:', error);
    return NextResponse.json({ error: 'Error interno al procesar la imagen' }, { status: 500 });
  }
}