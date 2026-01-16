'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  type SizeOption = { name: string; weight: string; pieces?: string; price: number; discount?: number };

  // Si el producto no trae tamaños, generamos unos por defecto a partir del precio y unidad
  // Preferir las variantes reales procedentes del backend (vista products_with_variants)
  const sizes: SizeOption[] = Array.isArray((product as any).variants) && (product as any).variants.length > 0
    ? (product as any).variants.map((v: any) => ({
        name: v.name,
        description: v.description,
        weight: v.weight,
        unit: v.unit,
        pieces: v.pieces,
        price: Number(v.price),
        discount: v.discount ?? 0,
      }))
    : (() => {
        // Derivar tamaños si aún no existen variantes en DB
        const unit = String(product.unit || 'kg');
        const basePrice = Number(product.price || 0);
        if (unit === 'kg') {
          return [
            { name: 'Pequeña - 2kg', weight: '2', price: basePrice * 2, discount: 0 },
            { name: 'Mediana - 5kg', weight: '5', price: basePrice * 5, discount: 8 },
            { name: 'Grande - 10kg', weight: '10', price: basePrice * 10, discount: 12 },
          ];
        }
        return [
          { name: 'Unidad', weight: '1', price: basePrice, discount: 0 },
          { name: 'Pack 6', weight: '6', price: basePrice * 6, discount: 5 },
        ];
      })();

  const current = sizes[selectedIndex];
  const discount = current.discount ? current.discount / 100 : 0;
  const finalPrice = current.price * (1 - discount);
  const rawWeight: any = (current as any).weight;
  const weightNumber = (() => {
    if (typeof rawWeight === 'number') return rawWeight;
    if (rawWeight === null || rawWeight === undefined) return NaN;
    const parsed = parseFloat(String(rawWeight).replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? NaN : parsed;
  })();

  return (
    <>
      <main className="min-h-screen bg-gray-50">
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
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                <Image src={product.main_image_url} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-6">{product.description}</p>
              </div>

              {/* Selección de tamaños */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tamaño</h3>
                <div className="space-y-3">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{size.name}</p>
                          {size.pieces && (
                            <p className="text-sm text-gray-600">{size.pieces}</p>
                          )}
                          {size.discount && size.discount > 0 && (
                            <p className="text-xs text-green-600 font-medium">{size.discount}% de ahorro en precio y transporte</p>
                          )}
                        </div>
                        <div className="text-right">
                          {size.discount && size.discount > 0 ? (
                            <>
                              <p className="text-lg font-bold text-accent">€{(size.price * (1 - size.discount / 100)).toFixed(2)} EUR</p>
                              <p className="text-sm text-gray-500 line-through">€{size.price.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-accent">€{size.price.toFixed(2)} EUR</p>
                          )}
                          {String(product.unit || '').toLowerCase() === 'kg' && (
                            <p className="text-xs text-gray-500">€{(finalPrice / weightNumber).toFixed(2)} / {product.unit}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Impuesto incluido.</p>
              </div>

              {/* Cantidad y añadir al carrito */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors">-</button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors">+</button>
                  </div>
                </div>

                <button disabled={isAdding} className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${isAdding ? 'bg-green-600 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'}`}>
                  🛒 Añadir a la cesta - €{(finalPrice * quantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


