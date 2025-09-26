'use client';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import TestimonialCard from '@/components/TestimonialCard';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';

const heroSlides = [
  '/slide1.jpg',
  '/slide2.jpg',
  '/slide3.jpg',
  '/slide4.jpg',
  '/slide5.jpg',
];

// Datos de ejemplo para productos destacados
const featuredProducts = [
  {
    id: 1,
    name: 'Tomates Raf',
    price: 4.99,
    imageUrl: 'https://images.pexels.com/photos/9475238/pexels-photo-9475238.jpeg?w=500&h=500&fit=crop',
    unit: 'kg' as const,
  },
  {
    id: 2,
    name: 'Aceite de Oliva Virgen Extra',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
    unit: 'caja' as const,
  },
  {
    id: 3,
    name: 'Naranjas Ecológicas',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop',
    unit: 'kg' as const,
  },
  {
    id: 4,
    name: 'Aguacates Hass',
    price: 5.99,
    imageUrl: 'https://images.pexels.com/photos/3687927/pexels-photo-3687927.jpeg?w=500&h=500&fit=crop',
    unit: 'kg' as const,
  },
];

// Datos de ejemplo para testimonios
const testimonials = [
  {
    name: 'María García',
    role: 'Agricultora de Tomates',
    imageUrl: 'https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg?w=200&h=200&fit=crop',
    testimonial: 'Gracias a Sabor a Tierra, puedo vender mis productos directamente a los consumidores y recibir un precio justo por mi trabajo.',
  },
  {
    name: 'Juan Martínez',
    role: 'Productor de Aceite',
    imageUrl: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?w=200&h=200&fit=crop',
    testimonial: 'La plataforma nos ha permitido llegar a más clientes y mantener la calidad de nuestro aceite de oliva virgen extra.',
  },
  {
    name: 'Ana López',
    role: 'Agricultora de Cítricos',
    imageUrl: 'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?w=200&h=200&fit=crop',
    testimonial: 'Es increíble poder conectar directamente con los consumidores y ver cómo valoran nuestros productos ecológicos.',
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section Slider */}
        <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 transition-all duration-1000">
            <Image
              src={heroSlides[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              fill
              className="object-cover brightness-50 transition-all duration-1000"
              priority
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                Conectando Agricultores y Consumidores
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8">
                Productos frescos directamente del campo a tu mesa. 
                Apoya la agricultura local y disfruta de la mejor calidad.
              </p>
              <Link
                href="/productos"
                className="bg-accent hover:bg-accent/90 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors inline-block"
              >
                Descubre Nuestros Productos
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Productos Destacados</h2>
            <p className="text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              Descubre nuestra selección de productos frescos y de temporada, 
              cultivados con pasión por agricultores locales.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/productos"
                className="btn-primary inline-block"
              >
                Ver Todos los Productos
              </Link>
            </div>
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Nuestro Impacto</h2>
            <p className="text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              Cada compra contribuye a un sistema alimentario más sostenible y justo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
              <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">1,000+</h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg">Agricultores Apoyados</p>
              </div>
              <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">50,000+</h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg">Kg de Productos Vendidos</p>
              </div>
              <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">10,000+</h3>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg">Clientes Satisfechos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">Lo Que Dicen Nuestros Agricultores</h2>
            <p className="text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              Conoce las historias de los agricultores que hacen posible Sabor a Tierra.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 