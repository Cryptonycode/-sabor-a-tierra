'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useCart } from '@/context/CartContext';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  estimated_delivery: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image?: string;
  farmer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Marcar compra realizada al cargar correctamente
  useEffect(() => {
    if (!loading && order) {
      try { localStorage.setItem('hasPurchased', 'true'); } catch {}
    }
  }, [loading, order]);

  // Limpiar carrito cuando el usuario llega a la página de confirmación
  useEffect(() => {
    // Solo limpiar una vez cuando haya un order cargado correctamente
    if (order && !loading && !error) {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, loading, error]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      setOrder(response);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('No se pudo cargar la información del pedido.');
      
      // Mock data para desarrollo
      setOrder({
        id: orderId,
        order_number: 'ORD-2024-001',
        customer_email: 'cliente@email.com',
        customer_name: 'Juan Pérez',
        delivery_address: 'Calle Mayor 123',
        delivery_city: 'Madrid',
        delivery_postal_code: '28001',
        total_amount: 67.89,
        order_status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'card',
        estimated_delivery: '2024-01-25',
        created_at: new Date().toISOString(),
        items: [
          {
            id: '1',
            product_name: 'Tomates Ecológicos',
            product_image: 'https://images.unsplash.com/photo-1546470427-e9b62dcc7409?w=100&h=100&fit=crop',
            farmer_name: 'Agricultor García',
            quantity: 2,
            unit_price: 15.00,
            total_price: 30.00
          },
          {
            id: '2',
            product_name: 'Aceite de Oliva Virgen',
            product_image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop',
            farmer_name: 'Almazara López',
            quantity: 1,
            unit_price: 12.00,
            total_price: 12.00
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      card: 'Tarjeta de Crédito/Débito',
      paypal: 'PayPal',
      transfer: 'Transferencia Bancaria',
      cash_on_delivery: 'Pago Contra Reembolso'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      processing: 'text-purple-600',
      shipped: 'text-indigo-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar el pedido solicitado.'}</p>
          <Link
            href="/productos"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
          >
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
            <p className="text-gray-600">
              Gracias por tu compra. Tu pedido <strong>{order.order_number}</strong> ha sido procesado correctamente.
            </p>
          </div>

          {/* Order Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-gray-900">Email Enviado</h3>
              <p className="text-sm text-gray-600">
                Confirmación enviada a<br/>
                <strong>{order.customer_email}</strong>
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h3 className="font-semibold text-gray-900">Entrega Estimada</h3>
              <p className="text-sm text-gray-600">
                {new Date(order.estimated_delivery).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900">Pago</h3>
              <p className="text-sm text-gray-600">
                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status === 'paid' ? 'Confirmado' : 'Pendiente'}
                </span><br/>
                {getPaymentMethodLabel(order.payment_method)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Pedido</h2>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop'}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">por {item.farmer_name}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} x €{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{item.total_price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Entrega</h2>
                <div className="space-y-2">
                  <p><strong>Cliente:</strong> {order.customer_name}</p>
                  <p><strong>Dirección:</strong> {order.delivery_address}</p>
                  <p><strong>Ciudad:</strong> {order.delivery_city}, {order.delivery_postal_code}</p>
                  <p>
                    <strong>Estado:</strong> 
                    <span className={`ml-2 font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status === 'confirmed' && 'Confirmado'}
                      {order.order_status === 'processing' && 'Procesando'}
                      {order.order_status === 'shipped' && 'Enviado'}
                      {order.order_status === 'delivered' && 'Entregado'}
                      {order.order_status === 'pending' && 'Pendiente'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{(order.total_amount / 1.21).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>€4.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>€{(order.total_amount - (order.total_amount / 1.21) - 4.99).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>€{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  🖨️ Imprimir Pedido
                </button>
                
                <Link
                  href="/productos"
                  className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded text-center"
                >
                  Seguir Comprando
                </Link>
                
                <Link
                  href={`/track-order/${order.order_number}`}
                  className="block w-full bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded text-center"
                >
                  📦 Seguir Pedido
                </Link>
              </div>

              {/* Contact Support */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Necesitas ayuda?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>📧 info@saboratierra.com</p>
                  <p>📞 +34 900 123 456</p>
                  <p>🕒 L-V: 9:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">¿Qué pasa ahora?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
              <div className="flex items-start space-x-2">
                <span className="text-lg">1️⃣</span>
                <div>
                  <strong>Preparación</strong>
                  <p>Nuestros agricultores preparan tus productos frescos</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-lg">2️⃣</span>
                <div>
                  <strong>Envío</strong>
                  <p>Empaquetamos y enviamos tu pedido con cuidado</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-lg">3️⃣</span>
                <div>
                  <strong>Disfruta</strong>
                  <p>Recibe y disfruta de productos frescos del campo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
