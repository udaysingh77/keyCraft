import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Key, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { UserRole } from '../../types';

interface NavbarProps {
  currentView: 'home' | 'admin';
  onNavigate: (view: 'home' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm backdrop-blur-lg bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <Key className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                KeyCraft
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => onNavigate('home')}
                className={`${currentView === 'home' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-900'} transition`}
              >
                Shop
              </button>
              
              {user?.role === UserRole.ADMIN && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`${currentView === 'admin' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-900'} transition flex items-center`}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Dashboard
                </button>
              )}

              <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">Hi, {user.name}</span>
                    <button onClick={logout} className="text-gray-400 hover:text-gray-600" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center text-gray-500 hover:text-indigo-600 transition"
                  >
                    <UserIcon className="w-5 h-5 mr-1" />
                    <span>Login</span>
                  </button>
                )}

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-500 hover:text-indigo-600 transition"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center">
               <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-500 mr-4"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                Shop
              </button>
              {user?.role === UserRole.ADMIN && (
                 <button 
                 onClick={() => { onNavigate('admin'); setIsMobileMenuOpen(false); }}
                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
               >
                 Dashboard
               </button>
              )}
              {user ? (
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
                >
                  Logout ({user.name})
                </button>
              ) : (
                <button 
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50 w-full text-left"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};