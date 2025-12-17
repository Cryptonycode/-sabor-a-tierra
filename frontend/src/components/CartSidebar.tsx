'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import CartItem from './CartItem';

export default function CartSidebar() {
  const { cart, closeCart, clearCart } = useCart();
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [applying, setApplying] = useState(false);

  // Cerrar sidebar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };

    if (cart.isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el sidebar está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [cart.isOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    window.location.href = '/checkout';
  };

  const handleApplyDiscount = async () => {
    try {
      setApplying(true);
      setDiscountMessage('');
      const code = discountCodeInput.trim();
      if (!code) return;
      const res: any = await apiClient.get(`/discounts/validate/${encodeURIComponent(code)}`);
      if (res?.isValid && typeof res.percentage === 'number') {
        // Guardar en sessionStorage para que checkout lo recupere
        try {
          sessionStorage.setItem('appliedDiscount', JSON.stringify({ code, percentage: res.percentage }));
        } catch {}
        setDiscountMessage(`¡Descuento del ${res.percentage}% aplicado! Se verá reflejado en el checkout.`);
      } else {
        setDiscountMessage(res?.error || 'Código inválido o expirado');
        try { sessionStorage.removeItem('appliedDiscount'); } catch {}
      }
    } catch (e) {
      setDiscountMessage('Error al validar el código. Inténtalo de nuevo.');
    } finally {
      setApplying(false);
    }
  };

  if (!cart.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Carrito ({cart.totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-500 mb-4">
                Añade algunos productos para comenzar
              </p>
              <Link
                href="/productos"
                onClick={closeCart}
                className="btn-primary"
              >
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {/* Footer del sidebar - Resumen y acciones */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-3 sm:p-4 space-y-4">
            {/* Código de descuento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Código de descuento</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Introduce tu código"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={applying}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {applying ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
              {discountMessage && (
                <div className={`text-xs ${discountMessage.includes('aplicado') ? 'text-green-600' : 'text-red-600'}`}>{discountMessage}</div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-accent">
                {cart.totalPrice.toFixed(2)}€
              </span>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full btn-primary text-center py-3"
              >
                Finalizar Compra
              </button>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 sm:px-4 rounded transition-colors text-center text-sm sm:text-base"
                >
                  Ver Carrito Completo
                </Link>
                
                <button
                  onClick={clearCart}
                  className="bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-3 sm:px-4 rounded transition-colors text-sm sm:text-base"
                  title="Vaciar carrito"
                >
                  Vaciar
                </button>
              </div>
            </div>

            {/* Info de peso y envío */}
            <div className="text-center text-sm text-gray-600 pt-2 border-t space-y-1">
              <div>📦 Peso total: {cart.totalWeight?.toFixed(2) || '0.00'} kg</div>
              {cart.totalWeight > 20 && (
                <div className="text-red-600 font-medium">
                  ⚠️ Límite de peso excedido (máx 20kg)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}


