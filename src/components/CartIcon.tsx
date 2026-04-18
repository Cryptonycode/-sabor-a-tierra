'use client';
import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { cart, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-white hover:text-accent transition-colors"
      aria-label="Abrir carrito"
    >
      {/* Icono de carrito SVG */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
        />
      </svg>
      
      {/* Contador de productos */}
      {cart.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cart.totalItems > 99 ? '99+' : cart.totalItems}
        </span>
      )}
    </button>
  );
}


