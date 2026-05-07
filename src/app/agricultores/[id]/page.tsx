'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { farmerApi, ApiFarmer } from '@/lib/api';

interface ApiFarmerWithProducts extends ApiFarmer {
  products?: Array<{
    id: string;
    name: string;
    description?: string;
    main_image_url?: string;
  }>;
}

export default function FarmerPage() {
  const params = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<ApiFarmerWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const response = await farmerApi.getById(params.id);
        setFarmer(response as ApiFarmerWithProducts);
      } catch (err) {
        setError('No se pudo cargar el agricultor.');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchFarmer();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Agricultor no encontrado</h1>
          <Link href="/agricultores" className="btn-primary">
            Volver a agricultores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white py-4 border-b">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-primary">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/agricultores" className="hover:text-primary">Agricultores</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{farmer.first_name} {farmer.last_name}</span>
            </nav>
          </div>
        </section>

        <section className="relative h-72 overflow-hidden">
          <Image
            src={farmer.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop'}
            alt={`Campo de ${farmer.first_name} ${farmer.last_name}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/35"></div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{farmer.first_name} {farmer.last_name}</h1>
            <p className="text-gray-600 mb-4">{farmer.city}, {farmer.province}</p>
            <p className="text-gray-700 mb-6">{farmer.story || farmer.description || farmer.short_description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {(farmer.specialties || []).map((specialty, index) => (
                <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{farmer.years_experience || 0}</p>
                <p className="text-xs text-gray-600">Años de experiencia</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{farmer.hectares || 0}</p>
                <p className="text-xs text-gray-600">Hectáreas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{farmer.customers_served || 0}</p>
                <p className="text-xs text-gray-600">Clientes atendidos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos de este agricultor</h2>
            {farmer.products && farmer.products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {farmer.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.id}`}
                    className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40">
                      <Image
                        src={product.main_image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1000&h=600&fit=crop'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Este agricultor todavía no tiene productos publicados.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
