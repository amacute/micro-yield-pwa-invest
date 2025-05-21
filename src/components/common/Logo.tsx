
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

  const getColor = () => {
    return variant === 'white' ? 'text-white' : 'text-axiom-primary';
  };

  return (
    <div className={`flex items-center gap-2 ${getColor()}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-axiom-primary/20 rounded-full blur-md"></div>
        <div className={`${getSize()} aspect-square rounded-full bg-gradient-to-br from-axiom-primary to-axiom-secondary flex items-center justify-center`}>
          <span className="font-bold text-white">A</span>
        </div>
      </div>
      <span className="font-bold text-xl">Axiomify</span>
    </div>
  );
}
