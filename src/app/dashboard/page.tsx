"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';
import SessionTimeout from '@/components/SessionTimeout';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Property {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  currency: string;
  operationType: string;
  isPublished: boolean;
  isSold: boolean;
  images?: { url: string }[];
  seller: {
    id: string;
    fullName: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSold, setFilterSold] = useState<'all' | 'active' | 'sold'>('active');
  
  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'sell' | 'delete'>('sell');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    router.push('/login');
    return;
  }

  const parsedUser = JSON.parse(userData);

  if (parsedUser.mustChangePassword) {
    router.push('/change-password');
    return;
  }
  
  // ✅ Solo redirigir si es ADMIN
  if (parsedUser.role === 'ADMIN') {
    router.replace('/admin');
    return;
  }
  
  setUser(parsedUser);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties?limit=100');
      const data = await res.json();
      
      const myProperties = (data.properties || []).filter(
        (p: Property) => p.seller?.id === parsedUser.id
      );
      
      setAllProperties(myProperties);
    } catch (error) {
      console.error('❌ Error al cargar propiedades:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, [router]);


  const filteredProperties = useMemo(() => {
    if (filterSold === 'active') {
      return allProperties.filter(p => !p.isSold);
    }
    if (filterSold === 'sold') {
      return allProperties.filter(p => p.isSold);
    }
    return allProperties;
  }, [allProperties, filterSold]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Abrir modal para marcar como vendida
  const openSellModal = (property: Property) => {
    setSelectedProperty(property);
    setModalType('sell');
    setModalOpen(true);
  };

  // Abrir modal para eliminar
  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setModalType('delete');
    setModalOpen(true);
  };

  // Confirmar acción
  const handleConfirm = async () => {
    if (!selectedProperty) return;

    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (modalType === 'sell') {
        const res = await fetch(`/api/properties/${selectedProperty.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ isSold: true }),
        });

        if (!res.ok) throw new Error('Error al marcar como vendida');
      } else {
        const res = await fetch(`/api/properties/${selectedProperty.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al eliminar');
      }

      // Recargar la página
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al realizar la acción');
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProperty(null);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 font-semibold text-xl animate-pulse">Cargando panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionTimeout /> {/* Componente para manejar el tiempo de inactividad */}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              Inmo<span className="text-blue-600">Venezuela</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">Panel de Vendedor</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Hola, <strong>{user?.fullName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total en Inventario</div>
            <div className="text-3xl font-bold text-slate-900">{allProperties.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Disponibles</div>
            <div className="text-3xl font-bold text-blue-600">
              {allProperties.filter(p => !p.isSold).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Vendidas</div>
            <div className="text-3xl font-bold text-emerald-600">
              {allProperties.filter(p => p.isSold).length}
            </div>
          </div>
        </div>

        {/* Filtros y Nueva Propiedad */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Mis Propiedades</h2>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={filterSold}
              onChange={(e) => setFilterSold(e.target.value as 'all' | 'active' | 'sold')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700"
            >
              <option value="active">🟢 Activas ({allProperties.filter(p => !p.isSold).length})</option>
              <option value="sold">✓ Vendidas ({allProperties.filter(p => p.isSold).length})</option>
              <option value="all">📋 Todas ({allProperties.length})</option>
            </select>
            <Link
              href="/dashboard/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nueva Propiedad
            </Link>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Título</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ubicación</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{property.title}</td>
                      <td className="px-6 py-4 text-gray-600">{property.city}, {property.state}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {new Intl.NumberFormat('es-VE', { style: 'currency', currency: property.currency, maximumFractionDigits: 0 }).format(property.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          property.operationType === 'SALE' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {property.operationType === 'SALE' ? 'Venta' : 'Alquiler'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {property.isSold ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            ✓ Vendida
                          </span>
                        ) : (
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            property.isPublished 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {property.isPublished ? 'Publicado' : 'Borrador'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/properties/${property.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Ver
                          </Link>
                          {!property.isSold && (
                            <button
                              onClick={() => openSellModal(property)}
                              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                            >
                              ✓ Vender
                            </button>
                          )}
                          <button
                            onClick={() => openDeleteModal(property)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {filterSold === 'sold' ? 'No tienes propiedades vendidas aún' : 'No tienes propiedades en esta categoría'}
              </h3>
              <p className="text-gray-500 mb-6">
                {filterSold === 'sold' 
                  ? 'Las propiedades que marques como vendidas aparecerán aquí.' 
                  : 'Comienza agregando tu primera propiedad al inventario.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Confirmación Profesional */}
      {selectedProperty && (
        <ConfirmModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
          type={modalType}
          property={{
            id: selectedProperty.id,
            title: selectedProperty.title,
            price: selectedProperty.price,
            currency: selectedProperty.currency,
            city: selectedProperty.city,
            state: selectedProperty.state,
            operationType: selectedProperty.operationType,
            images: selectedProperty.images,
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}