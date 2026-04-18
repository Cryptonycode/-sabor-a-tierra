'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { AdminDashboardStats } from '@/types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Array<{ id: number; type: 'warning' | 'info' | 'success'; message: string; time: string }>>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);

        const nextAlerts: Array<{ id: number; type: 'warning' | 'info' | 'success'; message: string; time: string }> = [];
        if ((dashboardStats.low_stock_products ?? 0) > 0) {
          nextAlerts.push({
            id: 1,
            type: 'warning',
            message: `${dashboardStats.low_stock_products} productos con stock bajo`,
            time: 'ahora'
          });
        }
        if ((dashboardStats.pending_applications ?? 0) > 0) {
          nextAlerts.push({
            id: 2,
            type: 'info',
            message: `${dashboardStats.pending_applications} solicitudes de agricultores pendientes`,
            time: 'ahora'
          });
        }
        if ((dashboardStats.pending_orders ?? 0) === 0) {
          nextAlerts.push({
            id: 3,
            type: 'success',
            message: 'No hay pedidos pendientes',
            time: 'ahora'
          });
        }
        setAlerts(nextAlerts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar el dashboard';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        Error al cargar el dashboard: {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Productos',
      value: stats?.total_products || 0,
      icon: '📦',
      color: 'bg-blue-500',
      link: '/admin/productos'
    },
    {
      title: 'Pedidos Totales',
      value: stats?.total_orders || 0,
      icon: '📋',
      color: 'bg-green-500',
      link: '/admin/pedidos'
    },
    {
      title: 'Clientes',
      value: stats?.total_customers || 0,
      icon: '👥',
      color: 'bg-purple-500',
      link: '/admin/clientes'
    },
    {
      title: 'Agricultores',
      value: stats?.total_farmers || 0,
      icon: '👨‍🌾',
      color: 'bg-yellow-500',
      link: '/admin/agricultores'
    },
    {
      title: 'Ingresos Totales',
      value: `€${stats?.total_revenue?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: '💰',
      color: 'bg-emerald-500',
      link: '/admin'
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pending_applications || 0,
      icon: '⏳',
      color: 'bg-orange-500',
      link: '/admin/agricultores',
      alert: (stats?.pending_applications || 0) > 0
    },
  ];

  const urgentActions = [
    {
      title: 'Solicitudes de Agricultores',
      count: stats?.pending_applications || 0,
      description: 'Nuevas solicitudes esperando aprobación',
      link: '/admin/agricultores',
      urgent: true
    },
    {
      title: 'Pedidos Pendientes',
      count: stats?.pending_orders || 0,
      description: 'Pedidos que requieren procesamiento',
      link: '/admin/pedidos',
      urgent: (stats?.pending_orders ?? 0) > 5
    },
    {
      title: 'Stock Bajo',
      count: stats?.low_stock_products || 0,
      description: 'Productos que necesitan reposición',
      link: '/admin/inventario',
      urgent: (stats?.low_stock_products ?? 0) > 0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vista general del estado de tu e-commerce</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚨 Alertas Recientes</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  alert.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                  'bg-green-50 border border-green-200'
                }`}
              >
                <span className="text-gray-800">{alert.message}</span>
                <span className="text-sm text-gray-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer relative">
              {card.alert && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-full p-3 text-white text-2xl`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Urgent Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Acciones Urgentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {urgentActions.map((action, index) => (
            <Link key={index} href={action.link}>
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                action.urgent 
                  ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <span className={`text-xl font-bold ${action.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                    {action.count}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
                {action.urgent && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ⚠️ Requiere atención
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Pedidos Recientes</h2>
        {stats?.recent_orders?.length ? (
          <div className="space-y-3">
            {stats.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">€{Number(order.total_amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay actividad reciente.</p>
        )}
      </div>
    </div>
  );
}
