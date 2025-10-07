'use client';

import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function Unauthorized() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso No Autorizado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
          
          {admin && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Usuario actual:</strong> {admin.first_name} {admin.last_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rol:</strong> <span className="capitalize">{admin.role}</span>
              </p>
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {admin.email}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Link
            href="/admin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Volver al Dashboard
          </Link>
          
          <button
            onClick={logout}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si crees que esto es un error, contacta al administrador principal
          </p>
        </div>
      </div>
    </div>
  );
}

