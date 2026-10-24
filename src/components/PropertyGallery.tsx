"use client";

import { useState } from 'react';
import Image from 'next/image';
import ImageGalleryModal from './ImageGalleryModal';

interface PropertyGalleryProps {
  images: { id: string; url: string; isPrimary: boolean }[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openModal = (index: number) => {
    setInitialIndex(index);
    setModalOpen(true);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Imagen principal grande - clickeable */}
          <div 
            className="md:col-span-2 relative h-96 md:h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => openModal(0)}
          >
            <Image
              src={images[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-900 px-4 py-2 rounded-full font-medium">
                Ver galería completa
              </div>
            </div>
          </div>

          {/* Grid de imágenes secundarias - clickeables */}
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1, 5).map((image, index) => (
              <div 
                key={image.id} 
                className="relative h-48 md:h-full rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openModal(index + 1)}
              >
                <Image
                  src={image.url}
                  alt={`${title} - ${index + 2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Contador de fotos */}
        {images.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => openModal(0)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              📷 Ver las {images.length} fotos de la propiedad
            </button>
          </div>
        )}
      </div>

      {/* Modal con carrusel */}
      {modalOpen && (
        <ImageGalleryModal
          images={images}
          initialIndex={initialIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}