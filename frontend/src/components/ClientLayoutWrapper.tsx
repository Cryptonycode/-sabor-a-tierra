'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/context/CartContext';
import DiscountModal from '@/components/DiscountModal';
import DiscountBanner from '@/components/DiscountBanner';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        {children}
        <DiscountModal
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          onAutoOpen={() => setIsDiscountModalOpen(true)}
        />
        <DiscountBanner onOpenModal={() => setIsDiscountModalOpen(true)} />
        <CartSidebar />
      </CartProvider>
    </AuthProvider>
  );
}


