'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/context/CartContext';
import DiscountModal from '@/components/DiscountModal';
import DiscountBanner from '@/components/DiscountBanner';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsModalOpen(true);
      setIsBannerVisible(false);
    }, 10000);
    return () => clearTimeout(timerId);
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsBannerVisible(true);
  };

  const handleModalSubmitSuccess = () => {
    setIsModalOpen(false);
    setIsBannerVisible(false);
  };

  const handleBannerClick = () => {
    setIsBannerVisible(false);
    setIsModalOpen(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        {children}
        <DiscountModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmitSuccess={handleModalSubmitSuccess}
        />
        <DiscountBanner
          isVisible={isBannerVisible}
          onOpenModal={handleBannerClick}
        />
        <CartSidebar />
      </CartProvider>
    </AuthProvider>
  );
}


