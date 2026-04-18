'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/orderService';

type MyOrder = {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  items?: Array<{ id: string; product_name: string; quantity: number }>;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        setOrders(response.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-6">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-gray-600">Historial completo de tus compras</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-gray-600">Todavía no tienes pedidos.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{order.order_number}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES')} · {order.items?.length || 0} productos
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-700">Estado: {order.order_status}</div>
                  <div className="text-gray-700">Pago: {order.payment_status}</div>
                </div>
                <div className="font-semibold text-gray-900">€{Number(order.total_amount).toFixed(2)}</div>
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="inline-flex items-center justify-center px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                >
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
