'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { hasSeenTour, useTour } from '@/hooks/useTour';

interface TourContextValue {
  startTour: () => void;
}

const TourContext = createContext<TourContextValue>({ startTour: () => {} });

export function useTourContext() {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { startTour } = useTour();
  const { isLocked } = useSubscription();
  const autoStarted = useRef(false);

  useEffect(() => {
    if (autoStarted.current) return;
    if (isLocked) return;
    if (hasSeenTour()) return;

    autoStarted.current = true;
    const timer = setTimeout(() => startTour(), 1000);
    return () => clearTimeout(timer);
  }, [isLocked, startTour]);

  return <TourContext.Provider value={{ startTour }}>{children}</TourContext.Provider>;
}
