'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ThanksPage() {
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Generar número de pedido aleatorio para simular
    const randomOrderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    setOrderNumber(randomOrderNumber);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="w-10 h-10 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            {/* Main Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              ¡Gracias por tu pedido!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Tu compra ha sido procesada exitosamente. Hemos enviado los detalles 
              de tu pedido a tu correo electrónico.
            </p>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Detalles del Pedido
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de pedido:</span>
                  <span className="font-semibold text-primary">#{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="text-green-600 font-semibold">Confirmado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo estimado de entrega:</span>
                  <span className="font-semibold">2-3 días laborables</span>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    className="w-6 h-6 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Confirmación por Email</h3>
                <p className="text-gray-600 text-sm">
                  Recibirás un email con los detalles completos de tu pedido y el 
                  número de seguimiento.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    className="w-6 h-6 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v0" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Preparación del Pedido</h3>
                <p className="text-gray-600 text-sm">
                  Nuestros agricultores están preparando cuidadosamente tus productos 
                  frescos para el envío.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/productos"
                className="btn-primary inline-block px-8 py-3 text-center"
              >
                Seguir Comprando
              </Link>
              <Link
                href="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded transition-colors text-center"
              >
                Volver al Inicio
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-blue-700 mb-4">
                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <span className="text-blue-800">
                  📞 Teléfono: +34 900 123 456
                </span>
                <span className="text-blue-800">
                  ✉️ Email: pedidos@saboratierra.com
                </span>
              </div>
            </div>

            {/* Social Impact Message */}
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ¡Gracias por apoyar la agricultura local!
              </h3>
              <p className="text-green-700">
                Con tu compra estás contribuyendo directamente al sustento de agricultores 
                locales y promoviendo un sistema alimentario más sostenible.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


