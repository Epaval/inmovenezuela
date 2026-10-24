import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  city?: string;
  operationType?: string;
  propertyType?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limit = 6;
  const city = params.city || '';
  const operationType = params.operationType || '';
  const propertyType = params.propertyType || '';

  // Construir filtros
  const where: any = { isPublished: true };
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (operationType) where.operationType = operationType;
  if (propertyType) where.propertyType = propertyType;

  // Obtener propiedades y total
  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Ciudades únicas para el filtro
  const cities = await prisma.property.findMany({
    where: { isPublished: true },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Todas las <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Propiedades</span>
          </h1>
          <p className="text-xl text-gray-300">
            {total} propiedades disponibles en Venezuela
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
              <select
                name="city"
                defaultValue={city}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las ciudades</option>
                {cities.map((c) => (
                  <option key={c.city} value={c.city}>{c.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Operación</label>
              <select
                name="operationType"
                defaultValue={operationType}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="SALE">En Venta</option>
                <option value="RENT">En Alquiler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
              <select
                name="propertyType"
                defaultValue={propertyType}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="HOUSE">Casa</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="OFFICE">Oficina</option>
                <option value="LAND">Terreno</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Grid de propiedades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                {currentPage > 1 && (
                  <Link
                    href={`/properties?page=${currentPage - 1}&city=${city}&operationType=${operationType}&propertyType=${propertyType}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    ← Anterior
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/properties?page=${page}&city=${city}&operationType=${operationType}&propertyType=${propertyType}`}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={`/properties?page=${currentPage + 1}&city=${city}&operationType=${operationType}&propertyType=${propertyType}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            )}

            <p className="text-center text-gray-500 mt-6 text-sm">
              Mostrando {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, total)} de {total} propiedades
            </p>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-600 text-lg">No se encontraron propiedades con esos filtros.</p>
            <Link href="/properties" className="text-blue-600 hover:underline mt-4 inline-block">
              Limpiar filtros
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}