"use client";

import { useState, useRef } from 'react';

interface ImageSelectorProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
}

export default function ImageSelector({ onImagesSelected, maxImages = 10 }: ImageSelectorProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    
    if (files.length > remainingSlots) {
      setError(`Solo puedes agregar ${remainingSlots} imagen(es) más (máximo ${maxImages})`);
      return;
    }

    const newImages = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    setError('');
    
    // Notificar al padre
    onImagesSelected(updatedImages.map(img => img.file));

    // Limpiar el input para permitir seleccionar más
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesSelected(newImages.map(img => img.file));
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900"> Imágenes de la Propiedad</h3>
            <p className="text-sm text-blue-700 mt-1">
              Selecciona hasta {maxImages} fotos. La primera será la imagen principal.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{images.length}</div>
            <div className="text-xs text-blue-700">de {maxImages} imágenes</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={images.length >= maxImages}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        />

        {images.length >= maxImages && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ Has alcanzado el máximo de {maxImages} imágenes
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={image.preview}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badge de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  Principal
                </div>
              )}

              {/* Botón de eliminar */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* Número de orden */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Haz clic en "Seleccionar archivos" para agregar fotos</p>
          <p className="text-xs text-gray-500 mt-1">Puedes seleccionar múltiples imágenes a la vez</p>
        </div>
      )}
    </div>
  );
}