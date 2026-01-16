'use client';
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_notes?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  farmer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderTimeline {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const orderStatuses = [
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Procesando', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Pagado', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Fallido', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'all' ? '/orders' : `/orders?status=${statusFilter}`;
      const response = await apiClient.get<Order[]>(endpoint);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data para desarrollo
      setOrders([
        {
          id: '1',
          order_number: 'ORD-2024-001',
          customer_id: 'cust-1',
          customer_email: 'cliente@email.com',
          customer_name: 'Juan Pérez',
          customer_phone: '+34 600 123 456',
          delivery_address: 'Calle Mayor 123',
          delivery_city: 'Madrid',
          delivery_postal_code: '28001',
          delivery_notes: 'Llamar al llegar',
          total_amount: 45.50,
          subtotal: 42.00,
          tax_amount: 2.50,
          shipping_cost: 1.00,
          order_status: 'pending',
          payment_status: 'paid',
          payment_method: 'Tarjeta de crédito',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [
            {
              id: '1',
              product_id: 'prod-1',
              product_name: 'Tomates Ecológicos',
              product_image: 'https://images.unsplash.com/photo-1546470427-e9b62dcc7409?w=100&h=100&fit=crop',
              farmer_name: 'Agricultor García',
              quantity: 2,
              unit_price: 15.00,
              total_price: 30.00
            },
            {
              id: '2',
              product_id: 'prod-2',
              product_name: 'Aceite de Oliva Virgen',
              product_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop',
              farmer_name: 'Almazara López',
              quantity: 1,
              unit_price: 12.00,
              total_price: 12.00
            }
          ],
          timeline: [
            {
              id: '1',
              status: 'pending',
              notes: 'Pedido recibido',
              created_at: new Date().toISOString(),
              created_by: 'Sistema'
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      setActionLoading(orderId);
      
      await apiClient.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes || `Estado cambiado a ${newStatus}`,
        updated_by: 'admin-user-id'
      });

      // Si es enviado, solicitar número de seguimiento
      if (newStatus === 'shipped') {
        const trackingNumber = prompt('Introduce el número de seguimiento:');
        if (trackingNumber) {
          await apiClient.put(`/orders/${orderId}`, {
            tracking_number: trackingNumber
          });
        }
      }

      await fetchOrders();
      setSelectedOrder(null);
      
      // Notificar al cliente por email (simulado)
      alert(`Estado actualizado a "${newStatus}". Se ha enviado una notificación por email al cliente.`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado del pedido.');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      setActionLoading(orderId);
      
      await apiClient.put(`/orders/${orderId}/cancel`, {
        reason: reason,
        cancelled_by: 'admin-user-id'
      });

      await fetchOrders();
      setSelectedOrder(null);
      
      alert('Pedido cancelado con éxito. Se ha notificado al cliente.');
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error al cancelar el pedido.');
    } finally {
      setActionLoading(null);
    }
  };

  const processRefund = async (orderId: string, amount?: number) => {
    try {
      setActionLoading(orderId);
      
      const refundAmount = amount || parseFloat(prompt('Cantidad a reembolsar:') || '0');
      if (refundAmount <= 0) return;

      await apiClient.post(`/orders/${orderId}/refund`, {
        amount: refundAmount,
        reason: 'Reembolso procesado por administrador',
        processed_by: 'admin-user-id'
      });

      await fetchOrders();
      setSelectedOrder(null);
      
      alert(`Reembolso de €${refundAmount} procesado con éxito.`);
      
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error al procesar el reembolso.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statuses = type === 'order' ? orderStatuses : paymentStatuses;
    const statusInfo = statuses.find(s => s.value === status);
    
    if (!statusInfo) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600">Administra todos los pedidos de la plataforma</p>
        </div>
        
        {/* Status Filters */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-primary shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos ({orders.length})
          </button>
          {orderStatuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === status.value
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.label} ({orders.filter(o => o.order_status === status.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-sm text-gray-500">{order.items.length} productos</div>
                      {order.tracking_number && (
                        <div className="text-xs text-blue-600">Track: {order.tracking_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                      <div className="text-sm text-gray-500">{order.delivery_city}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.order_status, 'order')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.payment_status, 'payment')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalles
                      </button>
                      {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Motivo de cancelación:');
                            if (reason) cancelOrder(order.id, reason);
                          }}
                          disabled={actionLoading === order.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Pedido {selectedOrder.order_number}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer & Delivery */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Información del Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Nombre:</strong> {selectedOrder.customer_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                      <p><strong>Teléfono:</strong> {selectedOrder.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Dirección de Entrega:</strong></p>
                      <p>{selectedOrder.delivery_address}</p>
                      <p>{selectedOrder.delivery_city}, {selectedOrder.delivery_postal_code}</p>
                      {selectedOrder.delivery_notes && (
                        <p><strong>Notas:</strong> {selectedOrder.delivery_notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Productos</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.product_name}</h5>
                          <p className="text-sm text-gray-600">por {item.farmer_name}</p>
                          <p className="text-sm">Cantidad: {item.quantity} x €{item.unit_price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Historial del Pedido</h4>
                  <div className="space-y-3">
                    {selectedOrder.timeline.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                        <div className="w-3 h-3 bg-primary rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="font-medium">{event.status}</p>
                          {event.notes && <p className="text-sm text-gray-600">{event.notes}</p>}
                          <p className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleString('es-ES')}
                            {event.created_by && ` - ${event.created_by}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Resumen del Pedido</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>€{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span>€{selectedOrder.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuestos:</span>
                      <span>€{selectedOrder.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                      <span>Total:</span>
                      <span>€{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Cambiar Estado</h4>
                  <div className="space-y-3">
                    {orderStatuses.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                        disabled={
                          selectedOrder.order_status === status.value || 
                          actionLoading === selectedOrder.id ||
                          (status.value === 'shipped' && selectedOrder.payment_status !== 'paid')
                        }
                        className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                          selectedOrder.order_status === status.value
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Actions */}
                {selectedOrder.payment_status === 'paid' && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Acciones de Pago</h4>
                    <button
                      onClick={() => processRefund(selectedOrder.id)}
                      disabled={actionLoading === selectedOrder.id}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      Procesar Reembolso
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Acciones Rápidas</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => alert('Funcionalidad de envío de email en desarrollo')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded"
                    >
                      📧 Enviar Email al Cliente
                    </button>
                    <button
                      onClick={() => alert('Funcionalidad de impresión en desarrollo')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded"
                    >
                      🖨️ Imprimir Etiqueta de Envío
                    </button>
                    <button
                      onClick={() => alert('Funcionalidad de facturación en desarrollo')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded"
                    >
                      📄 Generar Factura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
