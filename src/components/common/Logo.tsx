
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'white';
}

export function Logo({ size = 'medium', variant = 'default' }: LogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'h-8';
      case 'medium':
        return 'h-10';
      case 'large':
        return 'h-12';
      default:
        return 'h-10';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src="https://img.freepik.com/premium-vector/peer-peer-p2p-payment-online-model-support-transfer-money-peertopeer-technology-concept-mobile-phone-screen-closeup-smartphone-wireframe-hands-vector-illustration_127544-2563.jpg?uid=R184108826&ga=GA1.1.1999243242.1748064813&semt=ais_hybrid&w=740"
        alt="Axiomify P2P Platform"
        className={`${getSize()} object-contain`}
      />
    </div>
  );
}
