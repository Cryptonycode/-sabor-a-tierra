'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import FarmerRegistrationModal from '@/components/FarmerRegistrationModal';

export default function AboutUsPage() {
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  return (
    <div>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-primary text-white py-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre Nosotros</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Conectando agricultores locales con consumidores conscientes para un futuro alimentario más sostenible
              </p>
            </div>
          </div>
        </section>

        {/* Nuestra Historia */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative w-full h-64 md:h-[400px] rounded-xl overflow-hidden mb-8">
                <Image 
                  src="/about-hero.jpg"
                  alt="Agricultores trabajando en un campo mediterráneo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Sabor a Tierra nació de una visión simple pero poderosa: crear un puente directo entre los 
                    agricultores locales y las personas que valoran la calidad y la sostenibilidad en su alimentación.
                  </p>
                  <p>
                    Todo comenzó cuando nos dimos cuenta de que muchos agricultores excepcionales tenían dificultades 
                    para llegar a los consumidores, mientras que estos últimos buscaban productos frescos y de calidad 
                    sin saber dónde encontrarlos.
                  </p>
                  <p>
                    Hoy, somos una plataforma que no solo conecta, sino que transforma la manera en que pensamos 
                    sobre nuestros alimentos y quienes los producen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestros Valores */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nuestros Valores</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sostenibilidad</h3>
                <p className="text-gray-600">
                  Promovemos prácticas agrícolas sostenibles y apoyamos a agricultores que respetan el medio ambiente.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Comercio Justo</h3>
                <p className="text-gray-600">
                  Garantizamos precios justos para los agricultores y transparencia total en nuestras operaciones.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Comunidad Local</h3>
                <p className="text-gray-600">
                  Fortalecemos las economías locales y fomentamos la conexión entre productores y consumidores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestro Impacto */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nuestro Impacto</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-gray-600">Agricultores Asociados</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-gray-600">Localidades Alcanzadas</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <p className="text-gray-600">Clientes Satisfechos</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">-30%</div>
                <p className="text-gray-600">Huella de Carbono</p>
              </div>
            </div>
          </div>
        </section>

        {/* Únete al Movimiento */}
        <section className="bg-accent text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Únete al Movimiento</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Ya sea como agricultor o consumidor, tú puedes ser parte del cambio hacia un sistema alimentario más justo y sostenible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-accent font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsFarmerModalOpen(true)}
              >
                Registrarse como Agricultor
              </button>
              <Link href="/productos">
                <button className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">
                  Explorar Productos
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <FarmerRegistrationModal
        isOpen={isFarmerModalOpen}
        onClose={() => setIsFarmerModalOpen(false)}
      />
    </div>
  );
}
