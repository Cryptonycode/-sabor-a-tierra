'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { discountService } from '@/services/discountService';
import { orderService } from '@/services/orderService';
import { CheckoutPayload } from '@/types/order';

export default function CheckoutPage() {
  const { cart, clearCart, isLoading } = useCart();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);
  const [discountMessage, setDiscountMessage] = useState('');
  const [mode, setMode] = useState<'choose' | 'guest' | 'login'>('choose');
  const [loginEmail, setLoginEmail] = useState('');
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CheckoutPayload, 'items' | 'subtotal' | 'shipping_cost' | 'tax_amount' | 'total_amount'>>({
    customer_info: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
    delivery_address: {
      address: '',
      city: '',
      postal_code: '',
      province: '',
      delivery_notes: '',
    },
    payment_method: 'bizum',
    marketing_consent: false,
  });

  // Redirigir si el carrito está vacío, esperando a que cargue
  useEffect(() => {
    if (isLoading) return;
    if (cart.items.length === 0) {
      router.push('/productos');
    }
    // Recuperar descuento aplicado desde el sidebar (si existe)
    try {
      const stored = sessionStorage.getItem('appliedDiscount');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.code === 'string' && typeof parsed.percentage === 'number') {
          setAppliedDiscount(parsed);
          setDiscountMessage(`¡Descuento del ${parsed.percentage}% aplicado!`);
        }
      }
    } catch {}
  }, [isLoading, cart.items.length, router]);

  const handleInputChange = (section: keyof typeof formData | 'payment_method', field: string, value: string | boolean) => {
    console.log(`handleInputChange llamado con: section=${section}, field=${field}, value=${value}`);
    if (section === 'payment_method') {
      setFormData(prev => {
        const newState = { ...prev, payment_method: value as CheckoutPayload['payment_method'] };
        console.log('Nuevo estado (payment_method):', newState);
        return newState;
      });
    } else {
      setFormData(prev => {
        const sectionData: Record<string, unknown> = (prev as Record<string, any>)[section] || {};
        const newState = {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
        console.log(`Nuevo estado (${section}):`, newState);
        return newState;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const { first_name, last_name, email, phone } = formData.customer_info;
        return !!(first_name && last_name && email && phone);
      case 2:
        const { address, city, postal_code, province } = formData.delivery_address;
        return !!(address && city && postal_code && province);
      case 3:
        return !!formData.payment_method;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      alert('Por favor, completa todos los campos requeridos.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateShipping = (): number => {
    // Calcular peso total del carrito (kg)
    const totalWeight = cart.items.reduce((total, item) => {
      const itemWeight = item.weight || 0;
      return total + (itemWeight * item.quantity);
    }, 0);

    // Tabla de precios según peso (sin envío gratis por subtotal)
    // 0-4 kg: 3,90 €
    // 4-10 kg: 4,45 €
    // 10-15 kg: 5,90 €
    // Más de 15 kg: 10,95 € (sin límite de peso)
    
    if (totalWeight <= 4) {
      return 3.90;
    } else if (totalWeight <= 10) {
      return 4.45;
    } else if (totalWeight <= 15) {
      return 5.90;
    } else {
      // Más de 15kg: tarifa plana de 10,95€ sin límite de peso
      return 10.95;
    }
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    const amount = cart.totalPrice * (appliedDiscount.percentage / 100);
    return Math.min(amount, cart.totalPrice);
  };

  const calculateTotal = () => {
    // Total = Subtotal - Descuento + Envío (IVA 4% ya incluido en precios)
    return Math.max(0, cart.totalPrice - getDiscountAmount()) + calculateShipping();
  };

  const handleApplyDiscount = async () => {
    try {
      setDiscountMessage('');
      const code = discountCodeInput.trim();
      if (!code) return;
      const res = await discountService.validatePublic({
        code,
        customerEmail: formData.customer_info.email || undefined,
        subtotal: cart.totalPrice
      });
      if (res?.isValid && typeof res.percentage === 'number') {
        setAppliedDiscount({ code, percentage: res.percentage });
        setDiscountMessage(`¡Descuento del ${res.percentage}% aplicado!`);
      } else {
        setAppliedDiscount(null);
        setDiscountMessage(res?.error || 'Código inválido o expirado');
      }
    } catch (e) {
      setAppliedDiscount(null);
      setDiscountMessage('Error al validar el código. Inténtalo de nuevo.');
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        items: cart.items.map(item => ({
          product_id: String(item.id),
          quantity: item.quantity,
          unit_price: item.price
        })),
        customer_info: formData.customer_info,
        delivery_address: formData.delivery_address,
        payment_method: formData.payment_method,
        subtotal: cart.totalPrice,
        shipping_cost: calculateShipping(),
        tax_amount: 0, // IVA 4% incluido en precios
        total_amount: calculateTotal(),
        marketing_consent: formData.marketing_consent,
        discountCode: appliedDiscount?.code
      };

      const order = await orderService.create(orderData);
      const orderId: string = order.id;

      // Redirigir a página de confirmación (la limpieza del carrito se hará allí)
      router.push(`/order-confirmation/${orderId}`);

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  if (cart.items.length === 0) {
    return null; // El useEffect redirigirá cuando isLoading sea false
  }

  const steps = [
    { number: 1, title: 'Información Personal', icon: '👤' },
    { number: 2, title: 'Dirección de Entrega', icon: '📍' },
    { number: 3, title: 'Método de Pago', icon: '💳' },
    { number: 4, title: 'Confirmación', icon: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
            <p className="text-gray-600 mt-2">Completa tu pedido en unos simples pasos</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${currentStep >= step.number ? 'bg-primary' : 'bg-gray-300'}`}>
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                {/* Step 1: Customer Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">👤 Información Personal</h2>

                    {mode === 'choose' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-6 bg-white shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuar como Invitado</h3>
                          <p className="text-sm text-gray-600 mb-4">Rellena tus datos manualmente para completar el pedido.</p>
                          <button onClick={() => setMode('guest')} className="w-full bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary/90">Continuar como Invitado</button>
                        </div>
                        <div className="border rounded-lg p-6 bg-white shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Ya eres cliente?</h3>
                          <p className="text-sm text-gray-600 mb-4">Inicia sesión con enlace mágico para autocompletar tus datos.</p>
                          <button onClick={() => setMode('login')} className="w-full bg-accent text-white font-semibold py-2 px-4 rounded hover:bg-accent/90">Iniciar sesión</button>
                        </div>
                      </div>
                    )}

                    {mode === 'login' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Acceso con Enlace Mágico</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              if (!loginEmail) return;
                              setMagicSentTo(loginEmail);
                            }}
                            className="bg-accent text-white font-semibold py-2 px-4 rounded hover:bg-accent/90"
                          >
                            Enviar enlace de acceso
                          </button>
                          <button onClick={() => setMode('guest')} className="text-sm text-gray-600 hover:text-gray-900">Continuar como invitado</button>
                        </div>
                        {magicSentTo && (
                          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded">
                            ✅ ¡Enviado! Revisa tu email ({magicSentTo}) y haz clic en el enlace para iniciar sesión y autocompletar tus datos.
                          </div>
                        )}
                      </div>
                    )}

                    {mode === 'guest' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre*</label>
                          <input
                            type="text"
                            required
                            value={formData.customer_info.first_name}
                            onChange={(e) => handleInputChange('customer_info', 'first_name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Apellidos*</label>
                          <input
                            type="text"
                            required
                            value={formData.customer_info.last_name}
                            onChange={(e) => handleInputChange('customer_info', 'last_name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email*</label>
                          <input
                            type="email"
                            required
                            value={formData.customer_info.email}
                            onChange={(e) => handleInputChange('customer_info', 'email', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teléfono*</label>
                          <input
                            type="tel"
                            required
                            value={formData.customer_info.phone}
                            onChange={(e) => handleInputChange('customer_info', 'phone', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="+34 600 123 456"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Delivery Address */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">📍 Dirección de Entrega</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección*</label>
                        <input
                          type="text"
                          required
                          value={formData.delivery_address.address}
                          onChange={(e) => handleInputChange('delivery_address', 'address', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Calle, número, piso..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ciudad*</label>
                          <input
                            type="text"
                            required
                            value={formData.delivery_address.city}
                            onChange={(e) => handleInputChange('delivery_address', 'city', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Código Postal*</label>
                          <input
                            type="text"
                            required
                            value={formData.delivery_address.postal_code}
                            onChange={(e) => handleInputChange('delivery_address', 'postal_code', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provincia*</label>
                          <input
                            type="text"
                            required
                            value={formData.delivery_address.province}
                            onChange={(e) => handleInputChange('delivery_address', 'province', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notas de entrega</label>
                        <textarea
                          rows={3}
                          value={formData.delivery_address.delivery_notes}
                          onChange={(e) => handleInputChange('delivery_address', 'delivery_notes', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Instrucciones especiales para la entrega..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">💳 Método de Pago</h2>
                    <div className="space-y-4">
                      {[
                        { value: 'bizum', label: 'Bizum', icon: '📱', description: 'Pago instantáneo con tu móvil' },
                        { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦', description: 'Transferencia directa a nuestra cuenta' }
                      ].map((method) => (
                        <div
                          key={method.value}
                          className={`border rounded-lg p-4 transition-colors ${
                            formData.payment_method === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="payment_method"
                              value={method.value}
                              checked={formData.payment_method === method.value}
                              onChange={() => handleInputChange('payment_method', '', method.value)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">{method.icon}</span>
                                <div>
                                  <div className="font-medium text-gray-900">{method.label}</div>
                                  <div className="text-sm text-gray-500">{method.description}</div>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="marketing_consent"
                        checked={formData.marketing_consent}
                        onChange={(e) => setFormData(prev => ({...prev, marketing_consent: e.target.checked}))}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="marketing_consent" className="ml-2 block text-sm text-gray-900">
                        Acepto recibir ofertas y promociones por email
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">✅ Confirmación del Pedido</h2>
                    
                    {/* Customer Info Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Información del Cliente</h3>
                      <p className="text-sm text-gray-600">
                        {formData.customer_info.first_name} {formData.customer_info.last_name}<br/>
                        {formData.customer_info.email}<br/>
                        {formData.customer_info.phone}
                      </p>
                    </div>

                    {/* Delivery Address Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Dirección de Entrega</h3>
                      <p className="text-sm text-gray-600">
                        {formData.delivery_address.address}<br/>
                        {formData.delivery_address.city}, {formData.delivery_address.postal_code}<br/>
                        {formData.delivery_address.province}
                        {formData.delivery_address.delivery_notes && (
                          <>
                            <br/>
                            <strong>Notas:</strong> {formData.delivery_address.delivery_notes}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Método de Pago</h3>
                      <p className="text-sm text-gray-600">
                        {formData.payment_method === 'bizum' && '📱 Bizum'}
                        {formData.payment_method === 'transferencia' && '🏦 Transferencia Bancaria'}
                      </p>
                    </div>

                    {/* Terms */}
                    <div className="text-xs text-gray-500">
                      Al completar este pedido, aceptas nuestros términos y condiciones de venta.
                      Los productos perecederos no se pueden devolver.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitOrder}
                      disabled={loading}
                      className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
                
                {/* Products */}
                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={(item as any).imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} x €{item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        €{item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  {/* Código de descuento */}
                  <div className="flex items-end space-x-2 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Código de descuento</label>
                      <input
                        type="text"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Introduce tu código"
                      />
                    </div>
                    <button
                      onClick={handleApplyDiscount}
                      className="h-10 px-4 bg-primary text-white rounded-md hover:bg-primary/90 mt-6"
                    >
                      Aplicar
                    </button>
                  </div>
                  {discountMessage && (
                    <div className="text-sm mb-2 {discountMessage.includes('aplicado') ? 'text-green-600' : 'text-red-600'}">
                      {discountMessage}
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>€{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Descuento aplicado ({appliedDiscount.percentage}%):</span>
                      <span>-€{(cart.totalPrice * (appliedDiscount.percentage / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>{calculateShipping() === 0 ? 'Gratis' : `€${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 italic">
                    <span>IVA 4% (incluido)</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">
                    <div className="font-medium">🚚 Entrega estimada</div>
                    <div>2-3 días laborables</div>
                    {cart.totalPrice > 50 ? (
                      <div className="text-xs mt-1">✅ Envío gratuito (pedido &gt; €50)</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
