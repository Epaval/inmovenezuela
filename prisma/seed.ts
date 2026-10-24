import { PrismaClient, OperationType, PropertyType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Imágenes profesionales de Unsplash - URLs verificadas y estables
const propertyImages = {
  HOUSE: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1552321901-4598887188c8?w=800&q=80',
  ],
  APARTMENT: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'https://images.unsplash.com/photo-1552321901-4598887188c8?w=800&q=80',
  ],
  COMMERCIAL: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  ],
};

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Limpiar datos existentes para empezar limpio
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear un vendedor de prueba
  const hashedPassword = await bcrypt.hash('password123', 12);
  const seller = await prisma.user.create({
    data: {
      email: 'vendedor@inmovenezuela.com',
      username: 'vendedor1',
      passwordHash: hashedPassword,
      fullName: 'Carlos Rodríguez',
      phone: '+584121234567',
      role: 'SELLER',
    },
  });

  console.log('✅ Vendedor creado:', seller.fullName);

  // 3. Propiedades de ejemplo de Venezuela
  const properties = [
    {
      title: 'Casa en Playa Grande',
      description: 'Hermosa casa frente al mar, 4 habitaciones, piscina privada y acceso directo a la playa. Ideal para vacaciones o residencia permanente.',
      operationType: OperationType.RENT,
      propertyType: PropertyType.HOUSE,
      price: 1500,
      areaM2: 250,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 2,
      address: 'Calle Principal, Urbanización Playa Grande',
      city: 'Caraballeda',
      state: 'La Guaira',
      latitude: 10.5833,
      longitude: -66.9167,
      images: propertyImages.HOUSE,
    },
    {
      title: 'Apartamento de Lujo en Altamira',
      description: 'Moderno apartamento en la zona más exclusiva de Caracas. Vistas panorámicas, acabados de primera, seguridad 24/7.',
      operationType: OperationType.SALE,
      propertyType: PropertyType.APARTMENT,
      price: 185000,
      areaM2: 145,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpots: 2,
      address: 'Av. Francisco de Miranda, Altamira',
      city: 'Caracas',
      state: 'Distrito Capital',
      latitude: 10.5069,
      longitude: -66.8531,
      images: propertyImages.APARTMENT,
    },
    {
      title: 'Apartamento en Lechería',
      description: 'Espectacular apartamento con vista al mar en el corazón de Lechería. Cerca de restaurantes, centros comerciales y playas.',
      operationType: OperationType.SALE,
      propertyType: PropertyType.APARTMENT,
      price: 125000,
      areaM2: 98,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 1,
      address: 'Av. Municipal, Lechería',
      city: 'Lechería',
      state: 'Anzoátegui',
      latitude: 10.1667,
      longitude: -64.6333,
      images: propertyImages.APARTMENT,
    },
    {
      title: 'Casa en Las Mercedes',
      description: 'Amplia casa familiar en zona residencial tranquila. Jardín, terraza, cocina integral y cerca de colegios y centros comerciales.',
      operationType: OperationType.SALE,
      propertyType: PropertyType.HOUSE,
      price: 220000,
      areaM2: 320,
      bedrooms: 5,
      bathrooms: 4,
      parkingSpots: 3,
      address: 'Calle Las Acacias, Las Mercedes',
      city: 'Caracas',
      state: 'Distrito Capital',
      latitude: 10.4969,
      longitude: -66.8431,
      images: propertyImages.HOUSE,
    },
    {
      title: 'Local Comercial en Centro Comercial',
      description: 'Local comercial en excelente ubicación, alto tráfico peatonal. Ideal para retail, restaurante o servicios.',
      operationType: OperationType.RENT,
      propertyType: PropertyType.COMMERCIAL,
      price: 2500,
      areaM2: 85,
      bedrooms: 0,
      bathrooms: 2,
      parkingSpots: 0,
      address: 'CC Ciudad Tamanaco, Nivel 1',
      city: 'Caracas',
      state: 'Distrito Capital',
      latitude: 10.4900,
      longitude: -66.8500,
      images: propertyImages.COMMERCIAL,
    },
    {
      title: 'Apartamento en Maracaibo',
      description: 'Cómodo apartamento en zona norte de Maracaibo. Cerca de la Universidad del Zulia y centros comerciales.',
      operationType: OperationType.RENT,
      propertyType: PropertyType.APARTMENT,
      price: 450,
      areaM2: 75,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      address: 'Av. 5 de Julio, Maracaibo',
      city: 'Maracaibo',
      state: 'Zulia',
      latitude: 10.6667,
      longitude: -71.6167,
      images: propertyImages.APARTMENT,
    },
    {
      title: 'Casa en Valencia',
      description: 'Casa moderna en urbanización cerrada con seguridad. Piscina, área de juegos y cancha deportiva.',
      operationType: OperationType.SALE,
      propertyType: PropertyType.HOUSE,
      price: 95000,
      areaM2: 180,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 2,
      address: 'Urbanización El Viñedo, Valencia',
      city: 'Valencia',
      state: 'Carabobo',
      latitude: 10.1667,
      longitude: -68.0167,
      images: propertyImages.HOUSE,
    },
    {
      title: 'Apartamento en Mérida',
      description: 'Acogedor apartamento en la ciudad de Mérida. Clima fresco, cerca de la Universidad de Los Andes.',
      operationType: OperationType.RENT,
      propertyType: PropertyType.APARTMENT,
      price: 350,
      areaM2: 65,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      address: 'Av. Las Américas, Mérida',
      city: 'Mérida',
      state: 'Mérida',
      latitude: 8.5833,
      longitude: -71.1667,
      images: propertyImages.APARTMENT,
    },
  ];

  // 4. Crear las propiedades con sus imágenes
  for (const prop of properties) {
    const { images, ...propertyData } = prop;
    
    const createdProperty = await prisma.property.create({
      data: {
        ...propertyData,
        sellerId: seller.id,
        isPublished: true,
        isFeatured: true,
      },
    });

    // Crear imágenes para la propiedad
    for (let i = 0; i < images.length; i++) {
      await prisma.propertyImage.create({
        data: {
          url: images[i],
          publicId: `property_${createdProperty.id}_img_${i}`,
          propertyId: createdProperty.id,
          isPrimary: i === 0,
          order: i,
        },
      });
    }

    console.log(`✅ Propiedad creada: ${createdProperty.title} (${images.length} imágenes)`);
  }

    // Crear usuario ADMIN
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@inmovenezuela.com',
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'Administrador',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      mustChangePassword: false, // ✅ El admin no necesita cambiar
    },
  });

  console.log('✅ Admin creado: admin@inmovenezuela.com / admin123');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });