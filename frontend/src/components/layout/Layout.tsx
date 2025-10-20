import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, isLoggedIn, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary-50">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};
