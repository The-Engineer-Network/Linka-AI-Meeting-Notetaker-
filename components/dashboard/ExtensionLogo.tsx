import React from 'react';

interface ExtensionLogoProps {
  className?: string;
}

export const ExtensionLogo: React.FC<ExtensionLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className="text-xl font-bold text-gray-900">Linka</span>
    </div>
  );
};