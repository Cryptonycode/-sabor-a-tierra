'use client';

import React, { useState } from 'react';
import { discountService } from '@/services/discountService';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function DiscountModal({ isOpen, onClose, onSubmitSuccess }: DiscountModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un email válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await discountService.generateWelcomeCode(email);

      if (!res?.success) {
        setError(res?.message || 'No se pudo generar el código.');
        return;
      }

      setGeneratedCode(res.code ?? null);
      setSuccessMsg('¡Listo! Revisa tu correo, te hemos enviado tu código de descuento.');

      if (typeof window !== 'undefined') {
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('discountClaimed', 'true');
      }

      // Se deja tiempo para leer el mensaje y copiar el código antes de cerrar.
      setTimeout(() => {
        onSubmitSuccess();
      }, 4000);
    } catch (e) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¡10% de Descuento en tu Primera Compra!</h3>
        <p className="text-sm text-gray-600 mb-4">Déjanos tu email y te enviaremos tu código de descuento exclusivo.</p>

        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!generatedCode}
          className="mt-1 mb-3 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
          placeholder="tu@email.com"
        />
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 text-sm text-green-800 rounded">
            <p>{successMsg}</p>
            {generatedCode && (
              <p className="mt-2 text-center font-mono font-bold text-base tracking-wide text-primary">
                {generatedCode}
              </p>
            )}
          </div>
        )}

        {!generatedCode && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Obtener Descuento'}
          </button>
        )}
      </div>
    </div>
  );
}


