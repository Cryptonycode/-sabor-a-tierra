'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/cart';
import { apiClient } from '@/lib/api';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const { addToCart, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showFullStory, setShowFullStory] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = String(params.id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<any>(`/products/${productId}`);
        setProduct(data);
        setError(null);
      } catch (err: any) {
        console.error('Error cargando producto:', err);
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Scroll al inicio cuando cambia el producto
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
          <Link href="/productos" className="btn-primary">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const variants: any[] = Array.isArray(product.variants) ? product.variants : [];
  const currentVariant = variants[selectedVariant] || null;
  const finalPrice = currentVariant ? Number(currentVariant.price) : Number(product.price || 0);

  const handleAddToCart = async () => {
    if (!currentVariant) return;
    setIsAdding(true);

    const productToAdd: Product = {
      id: `${product.id}-${currentVariant.id}`,
      productId: String(product.id),
      variantId: String(currentVariant.id),
      name: `${product.name} - ${currentVariant.name}`,
      price: finalPrice,
      main_image_url: product.main_image_url,
      unit: product.unit,
      category: product.category,
      weight: currentVariant.weight || 0, // Peso en kg de la variante
    } as any;

    addToCart(productToAdd, quantity);

    await new Promise(resolve => setTimeout(resolve, 300));
    setIsAdding(false);
    toast.success('¡Producto añadido!');
    openCart();
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
              <Link href="/productos" className="hover:text-primary">Productos</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </nav>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galería de imágenes */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                {product.main_image_url && (
                  <Image
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">(42 opiniones)</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{product.description}</p>
              </div>

              {/* Variantes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Variantes</h3>
                {variants.length === 0 ? (
                  <p className="text-sm text-gray-600">No hay variantes disponibles para este producto.</p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id || index}
                        onClick={() => setSelectedVariant(index)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedVariant === index
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            {variant.description && (
                              <p className="text-sm text-gray-600">{variant.description}</p>
                            )}
                            {(variant.weight || variant.pieces || variant.unit) && (
                              <p className="text-xs text-gray-500">
                                {variant.weight ? `${variant.weight}${variant.unit || ''}` : ''}
                                {variant.pieces ? ` · ${variant.pieces} uds` : ''}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent">€{Number(variant.price).toFixed(2)} EUR</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">Impuesto incluido.</p>
              </div>

              {/* Cantidad y añadir al carrito */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || !currentVariant}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                    isAdding
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-accent hover:bg-accent/90'
                  }`}
                >
                  {isAdding ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a7.646 7.646 0 100 15.292V12" />
                      </svg>
                      <span>Añadiendo al carrito...</span>
                    </span>
                  ) : (
                    `🛒 Añadir a la cesta - €${(finalPrice * quantity).toFixed(2)}`
                  )}
                </button>

                <button className="w-full py-3 px-6 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors">
                  Pagar contra reembolso
                </button>

                <p className="text-center text-sm text-gray-600">
                  Más opciones de pago
                </p>
              </div>

              {/* Características del producto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center py-6 border-t border-gray-200">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Envíos a toda España</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Garantía de devolución</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium">Pago seguro</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                * duración {product.storage}
              </p>
            </div>
          </div>

          {/* Secciones de información */}
          <div className="mt-16 space-y-8">
            {/* Información del producto */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button className="w-full flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="text-primary mr-3">📋</span>
                  Información de producto
                </h3>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Características:</h4>
                  <ul className="space-y-1">
                    {(product.features || []).map((feature: any, index: number) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Información nutricional:</h4>
                  <p className="text-gray-600">{product.nutritionalInfo}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Conservación:</h4>
                  <p className="text-gray-600">{product.storage}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Temporada:</h4>
                  <p className="text-gray-600">{product.season}</p>
                </div>
              </div>
            </div>

            {/* Información sobre el envío */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <span className="text-primary mr-3">🚚</span>
                Información sobre el envío
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>• Envío gratuito en pedidos superiores a 50€</p>
                <p>• Entrega en 2-3 días laborables</p>
                <p>• Transporte refrigerado para mantener la frescura</p>
                <p>• Embalaje sostenible y reciclable</p>
                <p>• Seguimiento del pedido en tiempo real</p>
              </div>
            </div>
          </div>

          {/* Sección del agricultor */}
          <div className="mt-16 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                Conoce al agricultor que más ayuda necesita en este momento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  {product.farmer?.image && (
                    <Image
                      src={product.farmer.image}
                      alt={product.farmer?.name || 'Agricultor'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">{product.farmer?.name || 'Agricultor'}</h3>
                  <p className="text-gray-600 mb-4">
                    {showFullStory ? (product.farmer?.story || '') : (product.farmer?.story?.slice(0, 200) || '')}
                  </p>
                  <button
                    onClick={() => setShowFullStory(!showFullStory)}
                    className="text-accent hover:text-accent/80 font-medium mb-6"
                  >
                    {showFullStory ? 'Saber menos' : 'Saber más'}
                  </button>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Ubicación:</h4>
                    <p className="text-gray-600 text-sm">{product.farmer?.location || 'Ubicación no disponible'}</p>
                    <p className="text-gray-500 text-xs">{product.farmer?.coordinates || ''}</p>
                    <p className="text-blue-600 text-sm mt-2 cursor-pointer hover:underline">
                      📍 Cómo llegar • Ampliar el mapa
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={handleAddToCart}
                  className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Apoyar a {product.farmer?.name || 'este agricultor'} con la compra de {product.name}
                </button>
              </div>
            </div>
          </div>

          {/* ¿Por qué comprar aquí? */}
          <div className="mt-16 bg-gradient-to-r from-accent to-accent/80 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-8 text-center">
              ¿Por qué comprar directamente al agricultor en Sabor a Tierra?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">🟢</span>
                  <h3 className="text-xl font-semibold">Productos más frescos</h3>
                </div>
                <p className="text-base opacity-95 leading-relaxed">
                  Del campo a tu mesa, sin intermediarios ni almacenes. Solo lo mejor y más natural.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">🧑‍🌾</span>
                  <h3 className="text-xl font-semibold">El agricultor recibe más</h3>
                </div>
                <p className="text-base opacity-95 leading-relaxed">
                  El 70 % del precio va directamente al productor. Apoyas su trabajo y su futuro.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">🌍</span>
                  <h3 className="text-xl font-semibold">Más sostenible</h3>
                </div>
                <p className="text-base opacity-95 leading-relaxed">
                  Reducimos emisiones, envases y desperdicio alimentario. Compras con conciencia.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky bottom bar para móvil */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 lg:hidden z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{product.name}</p>
                <p className="text-base sm:text-lg font-bold text-accent">€{finalPrice.toFixed(2)}</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !currentVariant}
                className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <span>🛒</span>
                <span>Añadir</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
