'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const handleCheckout = () => {
    console.log('Checkout iniciado desde página:', cart);
    // Aquí se integrará la pasarela de pago en el futuro
    // Por ahora, redirigir a página de gracias
    router.push('/gracias');
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
    }
  };

  // Calcular descuentos y envío
  const subtotal = cart.totalPrice;
  
  // Calcular envío basado en peso total
  const totalWeight = cart.items.reduce((total, item) => {
    const itemWeight = item.weight || 0;
    return total + (itemWeight * item.quantity);
  }, 0);
  
  // Tabla de precios según peso
  // 0-4 kg: 3,90 € | 4-10 kg: 4,45 € | 10-15 kg: 5,90 € | +15 kg: 10,95 €
  let shippingCost = 3.90;
  if (totalWeight > 15) {
    shippingCost = 10.95;
  } else if (totalWeight > 10) {
    shippingCost = 5.90;
  } else if (totalWeight > 4) {
    shippingCost = 4.45;
  }
  
  const discount = subtotal >= 100 ? subtotal * 0.05 : 0; // 5% descuento si > 100€
  const total = subtotal + shippingCost - discount;

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-primary text-white py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Carrito de Compras
            </h1>
            <p className="text-base sm:text-lg">
              Revisa y confirma tu pedido antes de finalizar la compra
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {cart.items.length === 0 ? (
            /* Carrito vacío */
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-6"
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
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-500 mb-8">
                Parece que aún no has añadido productos a tu carrito.
              </p>
              <Link
                href="/productos"
                className="btn-primary inline-block"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Lista de productos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      Productos ({cart.totalItems})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {cart.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* Continuar comprando */}
                <div className="mt-6">
                  <Link
                    href="/productos"
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Continuar comprando
                  </Link>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                    Resumen del Pedido
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{subtotal.toFixed(2)}€</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío:</span>
                      <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                        {shippingCost === 0 ? 'Gratis' : `${shippingCost.toFixed(2)}€`}
                      </span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Descuento (5%):</span>
                        <span className="font-medium text-green-600">
                          -{discount.toFixed(2)}€
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total:</span>
                        <span className="text-xl font-bold text-accent">
                          {total.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de checkout */}
                  <button
                    onClick={handleCheckout}
                    className="w-full btn-primary py-3 text-base sm:text-lg font-semibold mb-4"
                  >
                    Finalizar Compra
                  </button>

                  {/* Información adicional */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Envío gratis en pedidos superiores a 50€</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Descuento del 5% en pedidos superiores a 100€</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Productos frescos directamente del campo</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Entrega en 2-3 días laborables</span>
                    </div>
                  </div>

                  {/* Métodos de pago */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-3">Métodos de pago aceptados:</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">VISA</div>
                      <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">Mastercard</div>
                      <div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">PayPal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


