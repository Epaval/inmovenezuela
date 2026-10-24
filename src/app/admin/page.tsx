"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActionConfirmModal from '@/components/ActionConfirmModal';
import SessionTimeout from '@/components/SessionTimeout';

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
  seller: {
    id: string;
    fullName: string;
  };
}

interface Agent {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  _count: {
    properties: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'agents'>('properties');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold'>('active');
  
  // Modales de formulario
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [showEditAgentModal, setShowEditAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    phone: '',
  });
  
  // ✅ CORREGIDO: Todos los useState deben estar AQUÍ, no dentro de useEffect
  const [actionLoading, setActionLoading] = useState(false);
  
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: '',
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'success' | 'info';
    icon: 'warning' | 'danger' | 'success' | 'info';
    confirmText: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning',
    icon: 'warning',
    confirmText: 'Confirmar',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    // ✅ Redirigir si NO es admin
    if (parsedUser.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    // ✅ Redirigir si debe cambiar contraseña
    if (parsedUser.mustChangePassword) {
      router.replace('/change-password');
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const propsRes = await fetch('/api/properties?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const propsData = await propsRes.json();
      setProperties(propsData.properties || []);

      const agentsRes = await fetch('/api/admin/agents', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const agentsData = await agentsRes.json();
      setAgents(agentsData.agents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear agente');
      }

      setSuccessModal({
        isOpen: true,
        message: `✅ Agente creado exitosamente!\n\nSe ha enviado un correo a ${formData.email} con las instrucciones de activación.`,
      });
      
      setShowCreateAgentModal(false);
      setFormData({ email: '', username: '', fullName: '', phone: '' });
      fetchData();

    } catch (error) {
      setConfirmModal({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al crear agente',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
        variant: 'danger',
        icon: 'danger',
        confirmText: 'Aceptar',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          isActive: selectedAgent.isActive,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al editar agente');
      }

      setShowEditAgentModal(false);
      fetchData();
    } catch (error) {
      setConfirmModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al editar agente',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
        variant: 'danger',
        icon: 'danger',
        confirmText: 'Aceptar',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = (agent: Agent) => {
    const newStatus = !agent.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    setConfirmModal({
      isOpen: true,
      title: newStatus ? 'Activar Agente' : 'Desactivar Agente',
      message: `¿Estás seguro de que deseas ${action} al agente ${agent.fullName}?\n\n${
        newStatus 
          ? 'El agente podrá iniciar sesión y publicar propiedades.' 
          : 'El agente no podrá iniciar sesión hasta que sea reactivado.'
      }`,
      variant: newStatus ? 'success' : 'warning',
      icon: newStatus ? 'success' : 'warning',
      confirmText: newStatus ? 'Sí, Activar' : 'Sí, Desactivar',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/agents/${agent.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ isActive: newStatus }),
          });

          if (!res.ok) throw new Error('Error al cambiar estado');

          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (error) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: 'Error al cambiar estado',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
            variant: 'danger',
            icon: 'danger',
            confirmText: 'Aceptar',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDeleteAgent = (agent: Agent) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Agente',
      message: `¿Estás seguro de eliminar permanentemente al agente ${agent.fullName}?\n\nEsta acción no se puede deshacer.`,
      variant: 'danger',
      icon: 'danger',
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/agents/${agent.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error al eliminar agente');

          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (error) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: error instanceof Error ? error.message : 'Error al eliminar agente',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
            variant: 'danger',
            icon: 'danger',
            confirmText: 'Aceptar',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDeleteProperty = (property: Property) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Propiedad',
      message: `¿Estás seguro de eliminar permanentemente la propiedad "${property.title}"?\n\nEsta acción no se puede deshacer.`,
      variant: 'danger',
      icon: 'danger',
      confirmText: 'Sí, Eliminar',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/properties/${property.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!res.ok) throw new Error('Error al eliminar propiedad');

          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (error) {
          setConfirmModal({
            isOpen: true,
            title: 'Error',
            message: 'Error al eliminar propiedad',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
            variant: 'danger',
            icon: 'danger',
            confirmText: 'Aceptar',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const openEditAgentModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      email: agent.email,
      username: agent.username,
      fullName: agent.fullName,
      phone: agent.phone || '',
    });
    setShowEditAgentModal(true);
  };

  const filteredProperties = properties.filter(p => {
    if (filterStatus === 'active') return !p.isSold;
    if (filterStatus === 'sold') return p.isSold;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 font-semibold text-xl animate-pulse">Cargando panel de administración...</div>
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
            <span className="text-purple-600 font-bold">Panel de Administración</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Admin: <strong>{user?.fullName}</strong>
            </span>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver mi Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/');
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'properties'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Todas las Propiedades ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'agents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Gestionar Agentes ({agents.length})
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'properties' ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Total Propiedades</div>
                <div className="text-3xl font-bold text-slate-900">{properties.length}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Disponibles</div>
                <div className="text-3xl font-bold text-blue-600">
                  {properties.filter(p => !p.isSold).length}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Vendidas</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {properties.filter(p => p.isSold).length}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Todas las Propiedades</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'sold')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">🟢 Activas ({properties.filter(p => !p.isSold).length})</option>
                <option value="sold">✓ Vendidas ({properties.filter(p => p.isSold).length})</option>
                <option value="all">📋 Todas ({properties.length})</option>
              </select>
            </div>

            {/* Tabla de propiedades */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredProperties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Título</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ubicación</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Agente</th>
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
                          <td className="px-6 py-4 text-gray-600">{property.seller.fullName}</td>
                          <td className="px-6 py-4">
                            {property.isSold ? (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                ✓ Vendida
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Activa
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/properties/${property.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Ver
                              </Link>
                              <button
                                onClick={() => handleDeleteProperty(property)}
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
                  <p className="text-gray-500">No hay propiedades en esta categoría</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Gestión de Agentes */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Agentes Registrados</h2>
              <button
                onClick={() => setShowCreateAgentModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Agente
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {agents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teléfono</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Propiedades</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {agents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{agent.fullName}</div>
                            <div className="text-sm text-gray-500">@{agent.username}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{agent.email}</td>
                          <td className="px-6 py-4 text-gray-600">{agent.phone || '—'}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                agent.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {agent.isActive ? '✓ Activo' : ' Inactivo'}
                              </span>
                              {!agent.emailVerified && (
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 ml-2">
                                  Email no verificado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{agent._count.properties}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditAgentModal(agent)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleToggleActive(agent)}
                                className={`text-sm font-medium ${
                                  agent.isActive 
                                    ? 'text-orange-600 hover:text-orange-800' 
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                              >
                                {agent.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleDeleteAgent(agent)}
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
                  <p className="text-gray-500 mb-4">No hay agentes registrados</p>
                  <button
                    onClick={() => setShowCreateAgentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                  >
                    Crear primer agente
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal Crear Agente */}
      {showCreateAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Crear Nuevo Agente</h3>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAgentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Creando...' : 'Crear Agente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Agente */}
      {showEditAgentModal && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Editar Agente</h3>
            <form onSubmit={handleEditAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAgent.isActive}
                  onChange={(e) => setSelectedAgent({ ...selectedAgent, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Agente activo</span>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditAgentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Modal de éxito moderno */}
      <ActionConfirmModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Agente Creado"
        message={successModal.message}
        variant="success"
        icon="success"
        confirmText="Aceptar"
        cancelText=""
      />

      {/* ✅ Modal de confirmación genérico (reemplaza a todos los confirm/alert nativos) */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
        confirmText={confirmModal.confirmText}
        loading={actionLoading}
        cancelText="Cancelar"
      />
    </div>
  );
}