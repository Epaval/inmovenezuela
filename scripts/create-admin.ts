import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@inmovenezuela.com';
  
  // Buscar si ya existe
  let admin = await prisma.user.findUnique({ where: { email } });

  if (admin) {
    // Actualizar a ADMIN si no lo es
    if (admin.role !== 'ADMIN') {
      admin = await prisma.user.update({
        where: { email },
        data: { 
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      console.log('✅ Usuario actualizado a ADMINISTRADOR');
    } else {
      console.log('✅ El administrador ya existe y está configurado correctamente');
    }
  } else {
    // Crear el administrador
    const hashedPassword = await bcrypt.hash('admin123', 12);
    admin = await prisma.user.create({
      data: {
        email,
        username: 'admin',
        passwordHash: hashedPassword,
        fullName: 'Administrador Principal',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    });
    console.log('✅ Administrador creado exitosamente');
  }

  console.log('Datos del admin:', { email: admin.email, role: admin.role, isActive: admin.isActive });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });