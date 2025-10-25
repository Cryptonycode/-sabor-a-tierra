'use client';

import React, { useEffect, useState } from 'react';

interface DiscountBannerProps {
  onOpenModal: () => void;
}

export default function DiscountBanner({ onOpenModal }: DiscountBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const modalShown = localStorage.getItem('discountModalShown') === 'true';
      const claimed = localStorage.getItem('discountClaimed') === 'true';
      const dismissed = localStorage.getItem('discountBannerDismissed') === 'true';
      if (modalShown && !claimed && !dismissed) {
        setIsVisible(true);
      }
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative bg-white shadow-xl border border-gray-200 rounded-lg px-4 py-3 flex items-center space-x-3">
        <button
          aria-label="Cerrar"
          onClick={() => {
            try { localStorage.setItem('discountBannerDismissed', 'true'); } catch {}
            setIsVisible(false);
          }}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black"
        >
          ×
        </button>
        <button
          onClick={onOpenModal}
          className="text-sm font-semibold text-gray-800 hover:text-primary focus:outline-none"
        >
          ¡10% Dto. Primera Compra! ✨
        </button>
      </div>
    </div>
  );
}


