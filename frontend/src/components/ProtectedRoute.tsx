'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'moderator';
  allowedRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRoles = ['admin', 'superadmin', 'moderator'] 
}: ProtectedRouteProps) {
  const { admin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
        return;
      }

      // Verificar roles si se especifica
      if (requiredRole && admin?.role !== requiredRole) {
        router.push('/admin/unauthorized');
        return;
      }

      // Verificar roles permitidos
      if (allowedRoles.length > 0 && admin && !allowedRoles.includes(admin.role)) {
        router.push('/admin/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, admin, requiredRole, allowedRoles, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // No mostrar contenido si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Verificar permisos
  if (requiredRole && admin?.role !== requiredRole) {
    return null;
  }

  if (allowedRoles.length > 0 && admin && !allowedRoles.includes(admin.role)) {
    return null;
  }

  return <>{children}</>;
}

