import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  useEffect(() => {
    // If user logs out while on admin page, redirect to home
    if (!user && currentView === 'admin') {
      setCurrentView('home');
    }
  }, [user, currentView]);

  const handleNavigate = (view: 'home' | 'admin') => {
    setCurrentView(view);
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'home' ? (
        <HomePage />
      ) : (
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;