'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/context/CartContext';
import DiscountModal from '@/components/DiscountModal';
import DiscountBanner from '@/components/DiscountBanner';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

// Rutas donde el banner DEBE mostrarse
const BANNER_ALLOWED_ROUTES = ['/', '/productos', '/agricultores', '/sobre-nosotros'];

// Rutas donde el banner NUNCA debe mostrarse
const BANNER_BLOCKED_ROUTES = ['/checkout', '/carrito'];
const BANNER_BLOCKED_PREFIXES = ['/dashboard', '/admin'];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [bannerEnabled, setBannerEnabled] = useState(false);

  // Función para verificar si el banner debe estar habilitado en la ruta actual
  const shouldShowBanner = (path: string): boolean => {
    // Verificar si está en una ruta bloqueada
    if (BANNER_BLOCKED_ROUTES.includes(path)) {
      return false;
    }
    
    // Verificar si comienza con un prefijo bloqueado
    for (const prefix of BANNER_BLOCKED_PREFIXES) {
      if (path.startsWith(prefix)) {
        return false;
      }
    }
    
    // Verificar si está en las rutas permitidas
    return BANNER_ALLOWED_ROUTES.includes(path);
  };

  // Función para verificar el estado del usuario y si debe ver el banner
  const checkBannerEligibility = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Verificar si el usuario ya interactuó con el banner
      const bannerDismissed = localStorage.getItem('bannerDismissedPermanently') === 'true';
      if (bannerDismissed) {
        return false;
      }
      
      // Verificar si el usuario ya se registró
      const hasRegistered = localStorage.getItem('userRegistered') === 'true';
      if (hasRegistered) {
        return false;
      }
      
      // Verificar si el usuario ya está logueado (usando el mismo key que AuthContext)
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuthenticated) {
        return false;
      }
      
      // Verificar si ya reclamó el descuento
      const discountClaimed = localStorage.getItem('discountClaimed') === 'true';
      if (discountClaimed) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // Efecto para actualizar la habilitación del banner según la ruta
  useEffect(() => {
    const routeAllowsBanner = shouldShowBanner(pathname);
    const userEligible = checkBannerEligibility();
    
    setBannerEnabled(routeAllowsBanner && userEligible);
  }, [pathname]);

  // Efecto para mostrar el modal automáticamente después de 10 segundos
  useEffect(() => {
    if (!bannerEnabled) return;
    
    const timerId = setTimeout(() => {
      setIsModalOpen(true);
      setIsBannerVisible(false);
    }, 10000);
    
    return () => clearTimeout(timerId);
  }, [bannerEnabled]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    
    // Preguntar si quiere cerrar permanentemente
    // Por ahora, solo mostramos el banner
    setIsBannerVisible(true);
  };

  const handleModalDismissPermanently = () => {
    setIsModalOpen(false);
    setIsBannerVisible(false);
    
    // Marcar como cerrado permanentemente
    if (typeof window !== 'undefined') {
      localStorage.setItem('bannerDismissedPermanently', 'true');
    }
    
    setBannerEnabled(false);
  };

  const handleModalSubmitSuccess = () => {
    setIsModalOpen(false);
    setIsBannerVisible(false);
    
    // Marcar como registrado y descuento reclamado
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRegistered', 'true');
      localStorage.setItem('discountClaimed', 'true');
    }
    
    setBannerEnabled(false);
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
        <Footer />
        {bannerEnabled && (
          <>
            <DiscountModal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSubmitSuccess={handleModalSubmitSuccess}
            />
            <DiscountBanner
              isVisible={isBannerVisible}
              onOpenModal={handleBannerClick}
            />
          </>
        )}
        <CartSidebar />
      </CartProvider>
    </AuthProvider>
  );
}


