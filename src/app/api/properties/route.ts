import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateSeller } from '@/lib/auth';
import { propertySchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/properties - Público (con filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const city = searchParams.get('city');
    const operationType = searchParams.get('operationType');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minBedrooms = searchParams.get('minBedrooms');

    const where: any = {
       isPublished: true,
       isSold: false };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (operationType) where.operationType = operationType;
    if (propertyType) where.propertyType = propertyType;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (minBedrooms) where.bedrooms = { gte: parseInt(minBedrooms) };

    const [properties, total] = await prisma.$transaction([
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          seller: { select: { id: true, fullName: true, phone: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error GET properties:', error);
    return NextResponse.json({ error: 'Error al obtener propiedades' }, { status: 500 });
  }
}

// POST /api/properties - Solo vendedores autenticados
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateSeller(request);
    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    
    // Aquí validamos con Zod. Si falla, lanzará un ZodError
    const data = propertySchema.parse(body);

    const property = await prisma.property.create({
      data: { 
        ...data, 
        sellerId: user.id 
      },
      include: { images: true },
    });

    return NextResponse.json(property, { status: 201 });
    } catch (error) {
    // Si es un error de validación de Zod
    if (error instanceof ZodError) {
      console.error('❌ Error de validación Zod:', error);
      
      // Manejo seguro para diferentes versiones de Zod
      const issues = error.issues || error.issues || [];
      const details = Array.isArray(issues) 
        ? issues.map((e: any) => ({ 
            field: (e.path || []).join('.'), 
            message: e.message 
          }))
        : [];
      
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details 
      }, { status: 400 });
    }
    
    // Cualquier otro error (Prisma, etc.)
    console.error('❌ Error POST property:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error del servidor' 
    }, { status: 500 });
  }
}