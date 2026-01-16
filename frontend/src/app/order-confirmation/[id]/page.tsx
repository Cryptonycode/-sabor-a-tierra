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

          {/* Payment Instructions for Offline Methods */}
          {(order.payment_method === 'transferencia' || order.payment_method === 'bizum') && order.payment_status !== 'paid' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                    ⚠️ Pago Pendiente - Acción Requerida
                  </h3>
                  
                  {order.payment_method === 'transferencia' && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        🏦 Realiza tu transferencia bancaria a:
                      </h4>
                      <div className="bg-gray-50 rounded p-3 mb-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">IBAN:</span>
                          <span className="font-mono font-semibold">ES00 0000 0000 0000 0000 0000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Beneficiario:</span>
                          <span className="font-semibold">Sabor a Tierra S.L.</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Concepto:</span>
                          <span className="font-mono font-semibold text-primary">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Importe:</span>
                          <span className="font-bold text-lg text-accent">€{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4">
                        <p className="text-sm font-semibold text-orange-800">
                          ⚠️ Es imprescindible enviar una captura de pantalla con el comprobante por WhatsApp para verificar el pedido
                        </p>
                      </div>
                      
                      <button
                        className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                        onClick={() => {
                          const whatsappNumber = '34600000000'; // Número de WhatsApp de la empresa
                          const message = `Hola, he realizado el pago del pedido ${order.order_number} por un importe de €${order.total_amount.toFixed(2)} mediante transferencia bancaria. Adjunto comprobante.`;
                          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Enviar comprobante por WhatsApp
                      </button>
                    </div>
                  )}

                  {order.payment_method === 'bizum' && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        📱 Realiza tu pago Bizum al número:
                      </h4>
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-center font-mono font-bold text-3xl text-primary mb-3">
                          600 000 000
                        </p>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Concepto:</span>
                          <span className="font-mono font-semibold text-primary">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Importe:</span>
                          <span className="font-bold text-lg text-accent">€{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4">
                        <p className="text-sm font-semibold text-orange-800">
                          ⚠️ Es imprescindible enviar una captura de pantalla con el comprobante por WhatsApp para verificar el pedido
                        </p>
                      </div>
                      
                      <button
                        className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                        onClick={() => {
                          const whatsappNumber = '34600000000'; // Número de WhatsApp de la empresa
                          const message = `Hola, he realizado el pago del pedido ${order.order_number} por un importe de €${order.total_amount.toFixed(2)} mediante Bizum. Adjunto comprobante.`;
                          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Enviar comprobante por WhatsApp
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-yellow-800 font-semibold mt-4 bg-yellow-100 border border-yellow-400 rounded p-3">
                    ⚠️ Tu pedido se procesará en un plazo máximo de 24 horas hábiles tras verificar el pago
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    <span>€{(order.total_amount - 4.99).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>€4.99</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 italic">
                    <span>IVA 4% (incluido)</span>
                    <span></span>
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
