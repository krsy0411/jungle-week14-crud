import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

interface CardSectionProps extends Partial<CardProps> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-secondary-100 overflow-hidden ${
        hoverable ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardSectionProps> = ({
  children,
  className,
}) => (
  <div className={`px-4 py-3 border-b border-secondary-100 ${className}`}>{children}</div>
);

export const CardBody: React.FC<CardSectionProps> = ({
  children,
  className,
}) => <div className={`px-4 py-4 ${className}`}>{children}</div>;

export const CardFooter: React.FC<CardSectionProps> = ({
  children,
  className,
}) => (
  <div className={`px-4 py-3 border-t border-secondary-100 bg-secondary-50 flex gap-2 ${className}`}>
    {children}
  </div>
);
