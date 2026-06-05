
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <img
      src="/logo.png"
      alt="Sync AI Logo"
      className={`rounded-full object-cover drop-shadow-sm ${className}`}
    />
  );
};

export default Logo;
