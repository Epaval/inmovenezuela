import PropertyCard from '@/components/PropertyCard';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const properties = await prisma.property.findMany({
    where: { 
      isPublished: true, 
      isSold: false },
      include: {
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <>
      {/* Hero Section - Fondo degradado oscuro profesional */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Encuentra tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">propiedad ideal</span> en Venezuela
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
              Explora nuestra selección exclusiva de apartamentos, casas y locales en las mejores ubicaciones del país. 
              Tu nuevo hogar te espera.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-bold text-blue-400 mb-1">500+</div>
                <div className="text-gray-300 text-sm font-medium">Propiedades</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-bold text-blue-400 mb-1">50+</div>
                <div className="text-gray-300 text-sm font-medium">Ciudades</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-bold text-blue-400 mb-1">100%</div>
                <div className="text-gray-300 text-sm font-medium">Confiable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Propiedades - Fondo blanco limpio */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Propiedades <span className="text-blue-600">Destacadas</span>
              </h2>
              <p className="text-gray-600 mt-2">Las mejores oportunidades del momento</p>
            </div>
            <Link href="/properties" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center">
              Ver todas
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <p className="text-gray-700 text-lg font-semibold">No hay propiedades disponibles</p>
              <p className="text-gray-500 mt-2">¡Vuelve pronto o contacta a un vendedor!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}