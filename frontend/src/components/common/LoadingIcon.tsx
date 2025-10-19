import React from 'react';

interface LoadingIconProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIcon: React.FC<LoadingIconProps> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'w-3 h-3 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2',
  };

  return (
    <span className={`inline-block ${sizeMap[size]} border-current border-t-transparent rounded-full animate-spin`} />
  );
};
