'use client';

import React, { useEffect, useState } from 'react';
import { useIsEligibleForFirstPurchaseOffer } from '@/hooks/useEligibilityCheck';

interface DiscountBannerProps {
  onOpenModal: () => void;
}

export default function DiscountBanner({ onOpenModal }: DiscountBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [snoozeExpired, setSnoozeExpired] = useState(Date.now());

  const eligible = useIsEligibleForFirstPurchaseOffer();
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const checkVisibility = () => {
      if (!eligible) {
        setIsVisible(false);
        return;
      }
      try {
        const shownThisSession = sessionStorage.getItem('discountModalShownThisSession') === 'true';
        if (!shownThisSession) {
          setIsVisible(false);
          return;
        }

        const snoozedStr = localStorage.getItem('bannerSnoozedUntil');
        if (snoozedStr) {
          const until = parseInt(snoozedStr, 10);
          if (!Number.isNaN(until) && until > Date.now()) {
            // Aún en snooze; programar re-evaluación
            setIsVisible(false);
            timeoutId = setTimeout(() => {
              setSnoozeExpired(Date.now());
            }, until - Date.now());
            return;
          }
        }
        // Elegible, mostrado en sesión y no snoozed
        setIsVisible(true);
      } catch (e) {
        console.error('Error checking banner visibility:', e);
        setIsVisible(false);
      }
    };

    checkVisibility();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [eligible, snoozeExpired]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative bg-white shadow-xl border border-gray-200 rounded-lg px-4 py-3 flex items-center space-x-3">
        <button
          aria-label="Cerrar"
          onClick={() => {
            try { localStorage.setItem('bannerSnoozedUntil', (Date.now() + 60000).toString()); } catch {}
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


