
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { P2PLendingDashboard } from '@/components/p2p/P2PLendingDashboard';

export default function InvestmentDetails() {
  const { id } = useParams();
  
  // For now, redirect to the P2P lending dashboard
  if (id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <P2PLendingDashboard />
      </div>
    );
  }
  
  return <Navigate to="/investments" replace />;
}
