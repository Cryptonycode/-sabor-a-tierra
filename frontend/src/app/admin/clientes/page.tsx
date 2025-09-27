'use client';
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  default_address?: string;
  default_city?: string;
  default_postal_code?: string;
  marketing_consent: boolean;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, filterStatus]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let endpoint = '/customers';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      if (params.toString()) endpoint += `?${params.toString()}`;
      
      const response = await apiClient.get<Customer[]>(endpoint);
      setCustomers(response);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Mock data para desarrollo
      setCustomers([
        {
          id: '1',
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan@email.com',
          phone: '+34 600 123 456',
          birth_date: '1985-05-15',
          gender: 'male',
          default_address: 'Calle Mayor 123',
          default_city: 'Madrid',
          default_postal_code: '28001',
          marketing_consent: true,
          is_active: true,
          total_orders: 12,
          total_spent: 456.78,
          last_order_date: '2024-01-15',
          created_at: '2023-06-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          first_name: 'María',
          last_name: 'García',
          email: 'maria@email.com',
          phone: '+34 600 987 654',
          default_address: 'Avenida Central 456',
          default_city: 'Barcelona',
          default_postal_code: '08001',
          marketing_consent: false,
          is_active: true,
          total_orders: 8,
          total_spent: 234.56,
          last_order_date: '2024-01-10',
          created_at: '2023-08-15',
          updated_at: '2024-01-10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const response = await apiClient.get<CustomerOrder[]>(`/customers/${customerId}/orders`);
      setCustomerOrders(response);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      // Mock data
      setCustomerOrders([
        {
          id: '1',
          order_number: 'ORD-2024-001',
          total_amount: 45.50,
          order_status: 'delivered',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          order_number: 'ORD-2024-002',
          total_amount: 67.89,
          order_status: 'processing',
          created_at: '2024-01-20'
        }
      ]);
    }
  };

  const toggleCustomerStatus = async (customerId: string, newStatus: boolean) => {
    try {
      await apiClient.put(`/customers/${customerId}`, {
        is_active: newStatus
      });
      
      await fetchCustomers();
      alert(`Cliente ${newStatus ? 'activado' : 'desactivado'} con éxito.`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Error al actualizar el estado del cliente.');
    }
  };

  const sendMarketingEmail = async (customerId: string) => {
    try {
      await apiClient.post(`/customers/${customerId}/send-marketing`, {
        template: 'newsletter',
        subject: 'Ofertas especiales para ti'
      });
      
      alert('Email enviado con éxito.');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el email.');
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && customer.is_active) ||
      (filterStatus === 'inactive' && !customer.is_active);
    
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la base de clientes y su actividad</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Clientes</dt>
                <dd className="text-lg font-medium text-gray-900">{customers.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Clientes Activos</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {customers.filter(c => c.is_active).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Ingresos Totales</dt>
                <dd className="text-lg font-medium text-gray-900">
                  €{customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Suscritos Marketing</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {customers.filter(c => c.marketing_consent).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                          {customer.first_name[0]}{customer.last_name[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      {customer.default_city || 'Sin dirección'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.total_orders} pedidos</div>
                    <div className="text-sm text-gray-500">€{customer.total_spent.toFixed(2)} gastados</div>
                    <div className="text-sm text-gray-500">
                      Último: {customer.last_order_date ? 
                        new Date(customer.last_order_date).toLocaleDateString('es-ES') : 
                        'Nunca'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      {customer.marketing_consent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📧 Marketing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCustomerSelect(customer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, !customer.is_active)}
                        className={`${customer.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {customer.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalles del Cliente: {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Información Personal</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p><strong>Teléfono:</strong> {selectedCustomer.phone || 'N/A'}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {selectedCustomer.birth_date || 'N/A'}</p>
                    <p><strong>Género:</strong> {selectedCustomer.gender || 'N/A'}</p>
                    <p><strong>Cliente desde:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Dirección por Defecto</h4>
                  <div className="space-y-1 text-sm">
                    <p>{selectedCustomer.default_address || 'No especificada'}</p>
                    <p>{selectedCustomer.default_city} {selectedCustomer.default_postal_code}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Estadísticas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Pedidos:</strong> {selectedCustomer.total_orders}</p>
                    <p><strong>Total Gastado:</strong> €{selectedCustomer.total_spent.toFixed(2)}</p>
                    <p><strong>Último Pedido:</strong> {selectedCustomer.last_order_date ? 
                      new Date(selectedCustomer.last_order_date).toLocaleDateString('es-ES') : 
                      'Nunca'
                    }</p>
                    <p><strong>Promedio por Pedido:</strong> €{selectedCustomer.total_orders > 0 ? 
                      (selectedCustomer.total_spent / selectedCustomer.total_orders).toFixed(2) : 
                      '0.00'
                    }</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedCustomer.marketing_consent && (
                    <button
                      onClick={() => sendMarketingEmail(selectedCustomer.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      📧 Enviar Email Marketing
                    </button>
                  )}
                  <button
                    onClick={() => toggleCustomerStatus(selectedCustomer.id, !selectedCustomer.is_active)}
                    className={`w-full font-bold py-2 px-4 rounded ${
                      selectedCustomer.is_active 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedCustomer.is_active ? 'Desactivar Cliente' : 'Activar Cliente'}
                  </button>
                </div>
              </div>

              {/* Orders History */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-gray-800 mb-3">Historial de Pedidos</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customerOrders.length > 0 ? (
                    customerOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{order.order_number}</h5>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">€{order.total_amount.toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Este cliente aún no ha realizado pedidos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
