'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_farmers: number;
  pending_applications: number;
  total_revenue: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: any[];
  recent_applications: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: '3 productos con stock bajo', time: '5 min' },
    { id: 2, type: 'info', message: '2 nuevas solicitudes de agricultores', time: '10 min' },
    { id: 3, type: 'success', message: '5 pedidos completados hoy', time: '1 hora' },
  ]);

  useEffect(() => {
    // Simular carga de datos - luego conectaremos con la API
    const fetchStats = async () => {
      try {
        // const response = await adminApi.getDashboardStats();
        // setStats(response);
        
        // Datos mock por ahora
        setStats({
          total_products: 24,
          total_orders: 156,
          total_customers: 89,
          total_farmers: 12,
          pending_applications: 3,
          total_revenue: 15420.50,
          pending_orders: 8,
          low_stock_products: 3,
          recent_orders: [],
          recent_applications: []
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
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
      urgent: stats?.pending_orders > 5
    },
    {
      title: 'Stock Bajo',
      count: stats?.low_stock_products || 0,
      description: 'Productos que necesitan reposición',
      link: '/admin/inventario',
      urgent: stats?.low_stock_products > 0
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Actividad Reciente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-800">Nuevo pedido #1234</span>
              <span className="text-sm text-gray-500">hace 5 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-800">Solicitud agricultor aprobada</span>
              <span className="text-sm text-gray-500">hace 15 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-800">Producto actualizado</span>
              <span className="text-sm text-gray-500">hace 1 hora</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Métricas de Rendimiento</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Tasa de Conversión</span>
                <span>3.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Satisfacción Cliente</span>
                <span>4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Tiempo Respuesta</span>
                <span>2.3h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
