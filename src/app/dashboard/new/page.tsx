"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageSelector from '@/components/ImageSelector';
import ConfirmModal from '@/components/ConfirmModal';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    operationType: 'SALE',
    propertyType: 'HOUSE',
    price: '',
    currency: 'USD',
    areaM2: '',
    bedrooms: '',
    bathrooms: '',
    parkingSpots: '',
    address: '',
    city: '',
    state: '',
    municipality: '',
    isPublished: true,
    isFeatured: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImagesSelected = (files: File[]) => {
    setSelectedImages(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que haya al menos una imagen
    if (selectedImages.length === 0) {
      setError('Debes seleccionar al menos una imagen para la propiedad');
      return;
    }

    // Mostrar modal de confirmación
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      
      // ✅ Validación robusta del token
      if (!token) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.push('/login');
        return;
      }

      // 1. Crear la propiedad
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        operationType: formData.operationType,
        propertyType: formData.propertyType,
        price: Number(formData.price) || 0,
        currency: formData.currency,
        areaM2: Number(formData.areaM2) || 0,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parkingSpots: Number(formData.parkingSpots) || 0,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        municipality: formData.municipality?.trim() || undefined,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ Si es 401, redirigir al login
        if (res.status === 401) {
          alert('Tu sesión ha expirado o el usuario ya no existe. Por favor inicia sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Error al crear la propiedad');
      }

      const propertyId = data.id;

      // 2. Subir las imágenes
      for (let i = 0; i < selectedImages.length; i++) {
        const base64 = await fileToBase64(selectedImages[i]);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId,
            image: base64,
            isPrimary: i === 0,
          }),
        });

        if (!uploadRes.ok) {
          console.error(`Error al subir imagen ${i + 1}`);
        }
      }

      // 3. Redirigir al dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la propiedad');
      setLoading(false);
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const num = Number(price) || 0;
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
  };

  const token = getToken();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Nueva Propiedad</h1>
          <p className="text-gray-600 mt-2">Completa la información y selecciona las imágenes</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: Apartamento de lujo en Altamira" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Operación *</label>
                <select name="operationType" value={formData.operationType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="SALE">En Venta</option>
                  <option value="RENT">En Alquiler</option>
                  <option value="BOTH">Venta y Alquiler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Propiedad *</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="HOUSE">Casa</option>
                  <option value="APARTMENT">Apartamento</option>
                  <option value="LAND">Terreno</option>
                  <option value="OFFICE">Oficina</option>
                  <option value="COMMERCIAL">Local Comercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                <input name="price" type="number" required value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe la propiedad en detalle..." />
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Características</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²) *</label>
                <input name="areaM2" type="number" required value={formData.areaM2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estacionamientos</label>
                <input name="parkingSpots" type="number" value={formData.parkingSpots} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Av. Principal, Edif. Ejemplo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Caracas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <input name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Distrito Capital" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input name="municipality" value={formData.municipality} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Chacao" />
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Opciones</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input name="isPublished" type="checkbox" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Publicar inmediatamente</span>
              </label>
              <label className="flex items-center">
                <input name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Marcar como propiedad destacada</span>
              </label>
            </div>
          </div>

          {/* Selección de Imágenes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ImageSelector
              onImagesSelected={handleImagesSelected}
              maxImages={10}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Revisar y Confirmar
            </button>
          </div>
        </form>

         {/* Modal de Confirmación */}
        <ConfirmModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          type="create" // ✅ Tipo correcto para creación
          property={{
            title: formData.title,
            imageCount: selectedImages.length,
            price: Number(formData.price) || 0,
            currency: formData.currency,
            city: formData.city,
            state: formData.state,
            operationType: formData.operationType,
          }}
          loading={loading}
        />
      </div>
    </div>
  );
}