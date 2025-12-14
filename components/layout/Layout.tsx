import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Cart } from '../shop/Cart';

interface LayoutProps {
  children: ReactNode;
  currentView: 'home' | 'admin';
  onNavigate: (view: 'home' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onNavigate={onNavigate} />
      <Cart />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            &copy; 2023 KeyCraft. All rights reserved. Handcrafted with love.
          </p>
        </div>
      </footer>
    </div>
  );
};