'use client';

import React, { useEffect, useState } from 'react';
// Simplificado: la visibilidad la controla el padre

interface DiscountBannerProps {
  isVisible: boolean;
  onOpenModal: () => void;
}

export default function DiscountBanner({ isVisible, onOpenModal }: DiscountBannerProps) {

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative bg-white shadow-xl border border-gray-200 rounded-lg px-4 py-3 flex items-center space-x-3">
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


