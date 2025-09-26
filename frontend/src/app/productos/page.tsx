'use client';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import FarmerRegistrationModal from '@/components/FarmerRegistrationModal';

// Categorías de productos
const categories = [
  { id: 'all', name: 'Todos', emoji: '🥗' },
  { id: 'vegetables', name: 'Verduras y Hortalizas', emoji: '🥬' },
  { id: 'fruits', name: 'Frutas', emoji: '🍎' },
  { id: 'oils', name: 'Aceites y Conservas', emoji: '🫒' },
  { id: 'dairy', name: 'Lácteos', emoji: '🧀' },
  { id: 'grains', name: 'Cereales y Legumbres', emoji: '🌾' },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { products: allProducts, loading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    let filtered = allProducts;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });

    return filtered;
  }, [allProducts, selectedCategory, searchTerm, sortBy]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
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
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestros Productos
            </h1>
            <p className="text-xl max-w-2xl">
              Descubre nuestra amplia selección de productos frescos y de temporada, 
              directamente del campo a tu mesa.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white shadow-sm py-6">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
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
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex justify-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-full sm:w-auto"
                >
                  <option value="name">Ordenar por nombre</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron productos que coincidan con tu búsqueda.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Call to Action para Agricultores */}
        <section className="bg-accent text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Eres agricultor o productor artesano?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Regístrate aquí para vender tus productos con nosotros
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-accent font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Registrarme como Productor
            </button>
            
            {/* Modal de Registro */}
            <FarmerRegistrationModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
