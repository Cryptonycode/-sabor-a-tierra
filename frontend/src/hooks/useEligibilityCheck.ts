'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useIsEligibleForFirstPurchaseOffer(): boolean {
  const { isAuthenticated } = useAuth();
  if (typeof window === 'undefined') return false;
  try {
    const hasPurchased = localStorage.getItem('hasPurchased') === 'true';
    const claimed = localStorage.getItem('discountClaimed') === 'true';
    return !isAuthenticated && !hasPurchased && !claimed;
  } catch {
    return false;
  }
}


