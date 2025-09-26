'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllFarmers } from '@/data/farmers';
import Footer from '@/components/Footer';
import FarmerRegistrationModal from '@/components/FarmerRegistrationModal';

const specialtyCategories = [
  { id: 'all', name: 'Todos', emoji: '🌾' },
  { id: 'frutas', name: 'Frutas', emoji: '🍎' },
  { id: 'verduras', name: 'Verduras', emoji: '🥬' },
  { id: 'aceites', name: 'Aceites', emoji: '🫒' },
  { id: 'citricos', name: 'Cítricos', emoji: '🍊' },
];

export default function AgricultoresPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const farmers = getAllFarmers();

  const filteredFarmers = farmers.filter(farmer => {
    if (selectedCategory === 'all') return true;
    
    const categoryMap: { [key: string]: string[] } = {
      'frutas': ['Aguacates', 'Mangos', 'Chirimoyas', 'Manzanas'],
      'verduras': ['Tomates', 'Pimientos', 'Berenjenas', 'Calabacines', 'Lechugas', 'Espinacas'],
      'aceites': ['Aceitunas', 'Aceite de Oliva'],
      'citricos': ['Naranjas', 'Limones', 'Mandarinas'],
    };

    return farmer.specialties.some(specialty => 
      categoryMap[selectedCategory]?.some(cat => specialty.includes(cat))
    );
  });

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

        {/* Categories Filter */}
        <section className="bg-white py-6 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {specialtyCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm sm:text-lg">{category.emoji}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Farmers Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id}
                  onClick={() => window.location.href = `/agricultores/${farmer.id}`}
                  className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={farmer.coverImage}
                      alt={`Campo de ${farmer.name}`}
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
                          src={farmer.image}
                          alt={farmer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{farmer.name}</h3>
                        <p className="text-gray-600 text-sm">{farmer.location}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {farmer.shortDescription}
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
                        <p className="text-lg sm:text-2xl font-bold text-primary">{farmer.stats.hectares}</p>
                        <p className="text-xs text-gray-600">Hectáreas</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg sm:text-2xl font-bold text-primary">{farmer.stats.yearsExperience}</p>
                        <p className="text-xs text-gray-600">Años exp.</p>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Sus productos:</h4>
                      <div className="flex space-x-3">
                        {farmer.products.slice(0, 2).map((product, index) => (
                          <div
                            key={index}
                            className="flex-1"
                          >
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="relative w-full h-20 mb-2 rounded overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <p className="text-xs font-medium text-gray-800 text-center">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <div
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                      >
                        Conocer a {farmer.name.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFarmers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No encontramos agricultores en esta categoría.
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
                  {farmers.reduce((acc, farmer) => acc + farmer.stats.hectares, 0)}
                </div>
                <p className="text-gray-600">Hectáreas Cultivadas</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">{farmers.length}</div>
                <p className="text-gray-600">Agricultores Activos</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {farmers.reduce((acc, farmer) => acc + farmer.stats.customersServed, 0)}+
                </div>
                <p className="text-gray-600">Clientes Atendidos</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {farmers.reduce((acc, farmer) => acc + farmer.stats.productsGrown, 0)}
                </div>
                <p className="text-gray-600">Variedades Cultivadas</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
