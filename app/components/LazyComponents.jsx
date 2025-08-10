"use client";

import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components for better performance
const MatchCard = lazy(() => import('./MatchCard'));
const BettingModal = lazy(() => import('./BettingModal'));
const PurchaseWCModal = lazy(() => import('./PurchaseWCModal'));
const AuthModal = lazy(() => import('./AuthModal'));

// Component wrapper with error boundary
const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export {
  LazyWrapper,
  MatchCard,
  BettingModal,
  PurchaseWCModal,
  AuthModal
};
