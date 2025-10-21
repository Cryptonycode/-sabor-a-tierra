'use client';
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface FarmerApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business_name?: string;
  production_type: 'organic' | 'conventional' | 'integrated';
  main_products: string;
  certifications?: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  farming_experience: number;
  hectares?: number;
  description: string;
  website?: string;
  social_media?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export default function FarmerApplicationsPage() {
  const { admin } = useAuth();
  const [applications, setApplications] = useState<FarmerApplication[]>([]);
  const [approvedFarmers, setApprovedFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FarmerApplication | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (filter === 'pending') {
        const endpoint = '/farmer-applications?status=pending';
        const response = await apiClient.get<FarmerApplication[]>(endpoint);
        setApplications(response);
        setApprovedFarmers([]);
      } else if (filter === 'approved' || filter === 'rejected') {
        const farmers = await apiClient.get<any[]>(`/farmers?status=${filter}`);
        setApprovedFarmers(farmers);
        setApplications([]);
      } else {
        // 'all' -> por simplicidad cargamos todas las aplicaciones
        const response = await apiClient.get<FarmerApplication[]>(`/farmer-applications`);
        setApplications(response);
        setApprovedFarmers([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      await apiClient.post(`/farmer-applications/${applicationId}/approve`, {
        reviewed_by: admin?.id
      });
      
      // Cambiar a la pestaña de aprobados y cerrar detalle
      setSelectedApplication(null);
      setFilter('approved');
      
      // Mostrar mensaje de éxito
      alert('Solicitud aprobada con éxito. El agricultor ha sido creado.');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error al aprobar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      setActionLoading(applicationId);
      await apiClient.post(`/farmer-applications/${applicationId}/reject`, {
        reviewed_by: 'admin-user-id',
        admin_notes: reason
      });
      
      // Actualizar la lista
      await fetchData();
      setSelectedApplication(null);
      
      alert('Solicitud rechazada con éxito.');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error al rechazar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectFarmer = async (farmerId: string) => {
    try {
      if (!confirm('¿Seguro que deseas rechazar a este agricultor?')) return;
      setActionLoading(farmerId);
      await apiClient.post(`/farmers/${farmerId}/reject`, {});
      await fetchData();
      alert('Agricultor rechazado correctamente.');
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      alert('Error al rechazar el agricultor.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getProductionTypeLabel = (type: string) => {
    const labels = {
      organic: 'Ecológica',
      conventional: 'Tradicional',
      integrated: 'Integrada'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Agricultores</h1>
          <p className="text-gray-600">Gestiona las solicitudes para unirse a la plataforma</p>
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'pending', label: 'Pendientes' },
            { key: 'approved', label: 'Aprobados' },
            { key: 'rejected', label: 'Rechazados' },
            { key: 'all', label: 'Todos' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado condicional: aplicaciones pendientes vs. agricultores aprobados/rechazados */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {filter === 'pending' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agricultor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiencia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agricultor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filter === 'pending' && applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{application.first_name} {application.last_name}</div>
                      <div className="text-sm text-gray-500">{application.email}</div>
                      <div className="text-sm text-gray-500">{application.city}, {application.province}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{application.business_name || 'Sin nombre comercial'}</div>
                      <div className="text-sm text-gray-500">{getProductionTypeLabel(application.production_type)}</div>
                      <div className="text-sm text-gray-500">{application.hectares ? `${application.hectares} ha` : 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{application.farming_experience} años</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(application.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(application.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => setSelectedApplication(application)} className="text-indigo-600 hover:text-indigo-900">Ver Detalles</button>
                      {application.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(application.id)} disabled={actionLoading === application.id} className="text-green-600 hover:text-green-900 disabled:opacity-50">{actionLoading === application.id ? 'Procesando...' : 'Aprobar'}</button>
                          <button onClick={() => { const reason = prompt('Motivo del rechazo:'); if (reason) handleReject(application.id, reason); }} disabled={actionLoading === application.id} className="text-red-600 hover:text-red-900 disabled:opacity-50">Rechazar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filter !== 'pending' && approvedFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{farmer.first_name} {farmer.last_name}</div>
                      <div className="text-sm text-gray-500">{farmer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{farmer.business_name || 'Sin nombre comercial'}</div>
                      <div className="text-sm text-gray-500">{farmer.specialties?.join(', ') || '—'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{farmer.province}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(farmer.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(farmer.created_at).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {farmer.status === 'approved' ? (
                      <button
                        onClick={() => handleRejectFarmer(farmer.id)}
                        disabled={actionLoading === farmer.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {actionLoading === farmer.id ? 'Procesando...' : 'Rechazar'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Detalles de la Solicitud
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Información Personal</h4>
                <div className="space-y-2">
                  <p><strong>Nombre:</strong> {selectedApplication.first_name} {selectedApplication.last_name}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                  <p><strong>Teléfono:</strong> {selectedApplication.phone}</p>
                  <p><strong>Dirección:</strong> {selectedApplication.address}</p>
                  <p><strong>Ciudad:</strong> {selectedApplication.city}, {selectedApplication.province}</p>
                  <p><strong>Código Postal:</strong> {selectedApplication.postal_code}</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Información del Negocio</h4>
                <div className="space-y-2">
                  <p><strong>Nombre del Negocio:</strong> {selectedApplication.business_name || 'N/A'}</p>
                  <p><strong>Tipo de Producción:</strong> {getProductionTypeLabel(selectedApplication.production_type)}</p>
                  <p><strong>Experiencia:</strong> {selectedApplication.farming_experience} años</p>
                  <p><strong>Hectáreas:</strong> {selectedApplication.hectares || 'N/A'}</p>
                  <p><strong>Productos Principales:</strong> {selectedApplication.main_products}</p>
                  <p><strong>Certificaciones:</strong> {selectedApplication.certifications || 'Ninguna'}</p>
                  {selectedApplication.website && (
                    <p><strong>Website:</strong> <a href={selectedApplication.website} target="_blank" className="text-blue-600 hover:text-blue-800">{selectedApplication.website}</a></p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold text-gray-800">Descripción</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedApplication.description}</p>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      const reason = prompt('Motivo del rechazo:');
                      if (reason) handleReject(selectedApplication.id, reason);
                    }}
                    disabled={actionLoading === selectedApplication.id}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    Rechazar Solicitud
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={actionLoading === selectedApplication.id}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {actionLoading === selectedApplication.id ? 'Procesando...' : 'Aprobar Solicitud'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
