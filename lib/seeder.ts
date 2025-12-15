import { db } from './db';
import { UserRole } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

export const seedDatabase = () => {
  // Clear existing data from LocalStorage
  localStorage.removeItem('keycraft_users');
  localStorage.removeItem('keycraft_products');
  localStorage.removeItem('keycraft_orders');
  localStorage.removeItem('keycraft_carts');
  localStorage.removeItem('keycraft_cart_guest');

  // Seed Admin User
  const adminUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@keycraft.com',
    password: 'hashed_admin123',
    role: UserRole.ADMIN
  };
  db.set('keycraft_users', [adminUser]);

  // Seed Products
  db.set('keycraft_products', INITIAL_PRODUCTS);

  // Initialize empty collections
  db.set('keycraft_orders', []);
  db.set('keycraft_carts', []);

  console.log('Database seeded successfully');
  window.location.reload();
};