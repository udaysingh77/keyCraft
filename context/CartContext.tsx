import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to sync local state
  const syncLocalToState = () => {
    const savedCart = localStorage.getItem('keycraft_cart_guest');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse guest cart", e);
      }
    } else {
      setItems([]);
    }
  };

  // Helper to sync state to local
  const syncStateToLocal = (newItems: CartItem[]) => {
    localStorage.setItem('keycraft_cart_guest', JSON.stringify(newItems));
  };

  // 1. Initial Load: Fetch from API if logged in, else LocalStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (user) {
        // Backend Mode
        try {
          const serverItems = await cartService.getUserCart(user.id);
          setItems(serverItems);
        } catch (error) {
          console.error("Failed to load user cart", error);
        }
      } else {
        // Guest Mode
        syncLocalToState();
      }
      setIsLoading(false);
    };

    loadCart();
  }, [user]);

  const addToCart = async (product: Product) => {
    // Optimistic UI update
    const prevItems = [...items];
    let newItems = [...items];
    const existing = newItems.find(item => item.id === product.id);
    
    if (existing) {
      newItems = newItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newItems = [...newItems, { ...product, quantity: 1 }];
    }
    
    setItems(newItems);
    setIsCartOpen(true);

    if (user) {
      // Sync with Backend
      try {
        await cartService.addToCart(user.id, product, 1);
      } catch (error) {
        console.error("Failed to add to server cart", error);
        setItems(prevItems); // Revert on failure
      }
    } else {
      // Sync with LocalStorage
      syncStateToLocal(newItems);
    }
  };

  const removeFromCart = async (productId: string) => {
    const prevItems = [...items];
    const newItems = items.filter(item => item.id !== productId);
    setItems(newItems);

    if (user) {
      try {
        await cartService.removeFromCart(user.id, productId);
      } catch (error) {
        console.error("Failed to remove from server cart", error);
        setItems(prevItems);
      }
    } else {
      syncStateToLocal(newItems);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const prevItems = [...items];
    const newItems = items.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    setItems(newItems);

    if (user) {
      try {
        await cartService.updateCartItem(user.id, productId, quantity);
      } catch (error) {
        console.error("Failed to update server cart", error);
        setItems(prevItems);
      }
    } else {
      syncStateToLocal(newItems);
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        await cartService.clearUserCart(user.id);
      } catch (error) {
        console.error("Failed to clear server cart", error);
      }
    } else {
      localStorage.removeItem('keycraft_cart_guest');
    }
  };

  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
      isCartOpen,
      setIsCartOpen,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};