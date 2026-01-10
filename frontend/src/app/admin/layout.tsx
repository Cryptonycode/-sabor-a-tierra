'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: '📊',
      description: 'Vista general y estadísticas'
    },
    { 
      name: 'Productos', 
      href: '/admin/productos', 
      icon: '📦',
      description: 'Gestionar productos'
    },
    { 
      name: 'Agricultores', 
      href: '/admin/agricultores', 
      icon: '👨‍🌾',
      description: 'Gestionar y aprobar agricultores'
    },
    { 
      name: 'Pedidos', 
      href: '/admin/pedidos', 
      icon: '📋',
      description: 'Gestión de pedidos'
    },
    { 
      name: 'Clientes', 
      href: '/admin/clientes', 
      icon: '👥',
      description: 'Gestión de clientes'
    },
    { 
      name: 'Inventario', 
      href: '/admin/inventario', 
      icon: '📦',
      description: 'Gestión de productos'
    },
    { 
      name: 'Devoluciones', 
      href: '/admin/devoluciones', 
      icon: '💰',
      description: 'Reembolsos y devoluciones'
    },
    { 
      name: 'Newsletter', 
      href: '/admin/newsletter', 
      icon: '📧',
      description: 'Gestión de suscriptores'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-primary transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-primary-dark">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-white font-bold text-lg">
                Admin Panel
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-primary-dark p-2 rounded"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-white hover:bg-primary-dark'
                }`}
                title={sidebarOpen ? '' : item.description}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm opacity-75">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-primary-dark">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {admin?.first_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-white">
                <div className="font-medium">
                  {admin ? `${admin.first_name} ${admin.last_name}` : 'Administrador'}
                </div>
                <div className="text-sm opacity-75">{admin?.email || 'admin@saboratierra.com'}</div>
                <div className="text-xs opacity-60 capitalize">{admin?.role || 'admin'}</div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">
                {admin?.first_name?.charAt(0) || 'A'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              Panel de Administración
            </h2>
            
            {/* Alerts indicator */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button 
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // Para páginas públicas del área admin (login/unauthorized) no usar el layout protegido
  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['admin', 'superadmin', 'moderator']}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ProtectedRoute>
    </AuthProvider>
  );
}
