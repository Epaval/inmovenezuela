import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  city: string;
  state: string;
  operationType: string;
  propertyType: string;
  images: { url: string; isPrimary: boolean }[];
}

export default function PropertyCard({ property }: { property: Property }) {
  const fallbackImages: Record<string, string> = {
    HOUSE: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    APARTMENT: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    LAND: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    OFFICE: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    COMMERCIAL: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
  };

  const imageUrl = property.images.find(img => img.isPrimary)?.url || 
                   property.images[0]?.url || 
                   fallbackImages[property.propertyType] || 
                   fallbackImages.HOUSE;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-VE', { 
      style: 'currency', 
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300 hover:-translate-y-2">
        {/* Contenedor de imagen optimizado */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image 
            src={imageUrl} 
            alt={property.title} 
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {/* Badge de operación */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
              property.operationType === 'SALE' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            }`}>
              {property.operationType === 'SALE' ? 'En Venta' : 'En Alquiler'}
            </span>
          </div>

          {/* Precio flotante en la imagen */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-white text-2xl font-bold drop-shadow-lg">
              {formatPrice(property.price, property.currency)}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-5">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            {property.city}, {property.state}
          </div>

          <div className="border-t border-gray-100 mb-5"></div>

          {/* Características en grid */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
              <div className="flex justify-center mb-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">{property.areaM2} m²</div>
              <div className="text-xs text-gray-500">Área</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
              <div className="flex justify-center mb-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">{property.bedrooms}</div>
              <div className="text-xs text-gray-500">Habitaciones</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
              <div className="flex justify-center mb-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-900">{property.bathrooms}</div>
              <div className="text-xs text-gray-500">Baños</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">Ver detalles</span>
            <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}