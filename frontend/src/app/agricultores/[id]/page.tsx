'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getFarmerById } from '@/data/farmers';
import { useCart } from '@/context/CartContext';
import Footer from '@/components/Footer';

export default function FarmerPage() {
  const params = useParams();
  const { addToCart, openCart } = useCart();
  const [showFullStory, setShowFullStory] = useState(false);

  const farmerId = parseInt(params.id as string);
  const farmer = getFarmerById(farmerId);

  if (!farmer) {
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

  const handleSupportFarmer = async (productId: number) => {
    // Aquí podrías añadir el producto principal del agricultor al carrito
    // Por simplicidad, vamos a redirigir a la página del producto
    window.location.href = `/productos/${productId}`;
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <section className="bg-white py-4 border-b">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-primary">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href="/agricultores" className="hover:text-primary">Agricultores</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{farmer.name}</span>
            </nav>
          </div>
        </section>

        {/* Hero Section with Cover Image */}
        <section className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={farmer.coverImage}
            alt={`Campo de ${farmer.name}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Farmer Profile Card */}
          <div className="absolute bottom-4 sm:bottom-8 left-0 right-0">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={farmer.image}
                      alt={farmer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">{farmer.name}</h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-3">{farmer.location}</p>
                    <p className="text-sm sm:text-base text-gray-700 mb-4">{farmer.shortDescription}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      {farmer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">
                      <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent">{farmer.stats.yearsExperience}</p>
                        <p className="text-xs text-gray-600">Años experiencia</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent">{farmer.stats.hectares}</p>
                        <p className="text-xs text-gray-600">Hectáreas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent">{farmer.stats.customersServed}+</p>
                        <p className="text-xs text-gray-600">Clientes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Story Section */}
              <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Mi Historia</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {showFullStory ? farmer.story : `${farmer.story.slice(0, 300)}...`}
                  </p>
                  <button
                    onClick={() => setShowFullStory(!showFullStory)}
                    className="text-accent hover:text-accent/80 font-medium mt-4"
                  >
                    {showFullStory ? 'Leer menos' : 'Leer más'}
                  </button>
                </div>
              </section>

              {/* Products Section */}
              <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Mis Productos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {farmer.products.map((product, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-32 sm:h-40 md:h-48">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                        <Link
                          href={`/productos/${product.productId}`}
                          className="btn-primary w-full text-center block"
                        >
                          Ver Producto
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Certificaciones y Prácticas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {farmer.certification.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">{cert}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800">{farmer.location}</p>
                      <p className="text-sm text-gray-600">{farmer.coordinates}</p>
                    </div>
                  </div>
                  
                  {farmer.contactInfo.email && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-700">{farmer.contactInfo.email}</p>
                    </div>
                  )}
                  
                  {farmer.contactInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-gray-700">{farmer.contactInfo.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Support Action */}
              <div className="bg-accent rounded-lg p-4 sm:p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-3">
                  Apoya a {farmer.name.split(' ')[0]}
                </h3>
                <p className="mb-6 opacity-90">
                  Con tu compra apoyas directamente el trabajo y la dedicación de {farmer.name.split(' ')[0]}.
                </p>
                {farmer.products.length > 0 && (
                  <button
                    onClick={() => handleSupportFarmer(farmer.products[0].productId)}
                    className="w-full bg-white text-accent font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Comprar {farmer.products[0].name}
                  </button>
                )}
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Experiencia:</span>
                    <span className="font-semibold text-gray-800">{farmer.stats.yearsExperience} años</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hectáreas:</span>
                    <span className="font-semibold text-gray-800">{farmer.stats.hectares} ha</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-semibold text-gray-800">{farmer.stats.productsGrown} variedades</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clientes atendidos:</span>
                    <span className="font-semibold text-gray-800">{farmer.stats.customersServed}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Farmers Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Conoce a Más Agricultores
            </h2>
            <div className="text-center">
              <Link
                href="/agricultores"
                className="btn-primary inline-block"
              >
                Ver Todos los Agricultores
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}


