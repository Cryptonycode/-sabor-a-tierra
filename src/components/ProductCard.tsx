'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/cart';
import { ProductVariant, pickCheapestVariant } from '@/lib/variants';

interface ProductCardProps {
  id: number | string;
  name: string;
  price: number;
  imageUrl?: string;
  main_image_url?: string; // Acepta también main_image_url de la API
  unit: 'kg' | 'caja' | string;
  category?: string;
  variants?: ProductVariant[];
}

export default function ProductCard({ id, name, price, imageUrl, main_image_url, unit, category, variants }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  // Usar main_image_url si existe, sino usar imageUrl
  const imageSrc = main_image_url || imageUrl || '';

  // El precio del producto es solo orientativo por unidad: lo que se vende es
  // la variante, así que la tarjeta muestra y añade la más barata.
  const cheapestVariant = pickCheapestVariant(variants);
  const basePrice = Number(price) || 0;
  const fromPrice = cheapestVariant ? Number(cheapestVariant.price) : basePrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación al hacer click en el botón
    e.stopPropagation();

    // Sin variante vendible no hay nada que comprar: el producto base nunca se
    // añade al carrito, se lleva al cliente a la ficha para que lo vea.
    if (!cheapestVariant) {
      router.push(`/productos/${id}`);
      return;
    }

    setIsAdding(true);

    // Mismo formato que usa la ficha de producto: el id compuesto permite que
    // el carrito distinga variantes y que el backend resuelva el precio real.
    const product: Product = {
      id: `${String(id)}-${String(cheapestVariant.id)}`,
      productId: String(id),
      variantId: String(cheapestVariant.id),
      name: `${name} - ${cheapestVariant.name}`,
      price: fromPrice,
      imageUrl: imageSrc,
      unit,
      category,
      weight: Number(cheapestVariant.weight) || 0,
    };

    addToCart(product);
    
    // Simular una pequeña demora para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsAdding(false);
    
    // Abrir el carrito brevemente para mostrar que se añadió
    openCart();
  };

  return (
    <Link href={`/productos/${id}`} className="block">
      <div className="card group cursor-pointer transition-transform duration-200 hover:scale-105">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {/* Renderizado condicional de la imagen */}
          {imageSrc && imageSrc.trim() !== '' ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            /* Fallback cuando no hay imagen */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <svg 
                  className="w-16 h-16 mx-auto text-gray-400 mb-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <span className="text-gray-500 text-xs">Sin imagen</span>
              </div>
            </div>
          )}
          {/* Badge de categoría */}
          {category && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {category === 'vegetables' && '🥬 Verduras'}
              {category === 'fruits' && '🍎 Frutas'}
              {category === 'oils' && '🫒 Aceites'}
              {category === 'dairy' && '🧀 Lácteos'}
              {category === 'grains' && '🌾 Cereales'}
            </div>
          )}
          {/* Overlay para indicar que es clickeable */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 text-primary px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
              Ver detalles
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col min-w-0">
              {cheapestVariant ? (
                <>
                  <span className="text-accent font-bold">Desde {fromPrice.toFixed(2)}€</span>
                  <span className="text-xs text-gray-500 truncate">
                    {cheapestVariant.name} · {basePrice.toFixed(2)}€/{unit}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-accent font-bold">{basePrice.toFixed(2)}€/{unit}</span>
                  <span className="text-xs text-gray-500">Ver formatos disponibles</span>
                </>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`btn-primary text-sm whitespace-nowrap transition-all duration-200 relative z-10 ${
                isAdding 
                  ? 'bg-green-600 hover:bg-green-600' 
                  : 'hover:scale-105'
              }`}
            >
              {isAdding ? (
                <span className="flex items-center space-x-1">
                  <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a7.646 7.646 0 100 15.292V12" />
                  </svg>
                  <span>Añadiendo...</span>
                </span>
              ) : cheapestVariant ? (
                '+ Añadir'
              ) : (
                'Ver opciones'
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 