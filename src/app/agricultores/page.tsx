'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFarmers } from '@/hooks/useFarmers';
import FarmerRegistrationModal from '@/components/FarmerRegistrationModal';

export default function AgricultoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { farmers, loading, error } = useFarmers();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando agricultores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-primary text-white py-10 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 flex items-center justify-center gap-3">
                <span className="text-4xl md:text-5xl lg:text-6xl">🇪🇸</span>
                Agricultura de España
              </h1>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-medium leading-relaxed mb-4">
                  🌱 <span className="font-semibold">Sabor a Tierra</span> es mucho más que una tienda online: 
                  es un movimiento que impulsa la agricultura local y apuesta por un modelo justo y sostenible.
                </p>
                
                <div className="text-base md:text-lg leading-relaxed opacity-95 space-y-2">
                  <p>Conoce a las personas que cultivan con pasión lo que llega a tu mesa.</p>
                  <p>Cada compra mejora su vida, protege el campo y transforma el futuro de la alimentación.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Farmers Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {farmers.map((farmer) => (
                <div
                  key={farmer.id}
                  onClick={() => window.location.href = `/agricultores/${farmer.id}`}
                  className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={farmer.cover_image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop'}
                      alt={`Campo de ${farmer.first_name} ${farmer.last_name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>

                  {/* Farmer Profile */}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={farmer.profile_image_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'}
                          alt={`${farmer.first_name} ${farmer.last_name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{farmer.first_name} {farmer.last_name}</h3>
                        <p className="text-gray-600 text-sm">{farmer.city}, {farmer.province}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {farmer.short_description || farmer.description}
                    </p>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {farmer.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                        {farmer.specialties.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            +{farmer.specialties.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-primary">{farmer.hectares || 0}</p>
                        <p className="text-xs text-gray-600">Hectáreas</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-primary">{farmer.years_experience || 0}</p>
                        <p className="text-xs text-gray-600">Años exp.</p>
                      </div>
                    </div>

                    {/* Specialties Preview */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Especialidades:</h4>
                      <div className="flex flex-wrap gap-2">
                        {farmer.specialties?.slice(0, 3).map((specialty, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {farmer.specialties && farmer.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{farmer.specialties.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <div
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                      >
                        Conocer a {farmer.first_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {farmers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No encontramos agricultores disponibles.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-accent text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Eres agricultor y quieres unirte a nosotros?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Forma parte de nuestra comunidad de agricultores y lleva tus productos 
              directamente a los consumidores que valoran la calidad y el trabajo artesanal.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-accent font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Únete como Agricultor
            </button>

            {/* Modal de Registro */}
            <FarmerRegistrationModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              El Impacto de Nuestra Comunidad
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  +20
                </div>
                <p className="text-gray-600">Hectáreas Cultivadas</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">{farmers.length}</div>
                <p className="text-gray-600">Agricultores Activos</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  +50
                </div>
                <p className="text-gray-600">Clientes atendidos</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  +15
                </div>
                <p className="text-gray-600">Variedades cultivadas</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
