
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
        src="https://dynamic.design.com/asset/logo/363760fa-2cec-4be1-9b8c-8156ef28f3a9/logo-search-grid-1x?logoTemplateVersion=2&v=638639748142130000&text=axiomify"
        alt="Axiomify P2P Platform"
        className={`${getSize()} object-contain`}
      />
    </div>
  );
}
