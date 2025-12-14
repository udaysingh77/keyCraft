import { Product, ProductFilterParams, PaginatedResponse } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { db } from '../lib/db';

const DB_KEY = 'keycraft_products';

// Helper to get raw list
const getDBProducts = () => db.get<Product[]>(DB_KEY, INITIAL_PRODUCTS);

// GET All Products (Pagination + Search)
export const getProducts = async (params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> => {
  await db.delay(500); // Simulate network
  let products = getDBProducts();

  // Filter by Active Status (unless admin requests inactive)
  if (!params.includeInactive) {
    products = products.filter(p => p.isActive);
  }

  // Filter by Search Query
  if (params.search) {
    const q = params.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Filter by Category
  if (params.category && params.category !== 'All') {
    products = products.filter(p => p.category === params.category);
  }

  // Sorting (Newest first)
  products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 100; // Default to 100 for now to keep UI simple
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = products.slice(offset, offset + limit);

  return {
    data: paginatedData,
    total,
    page,
    totalPages
  };
};

// GET Single Product
export const getProductById = async (id: string): Promise<Product | undefined> => {
  await db.delay(300);
  const products = getDBProducts();
  return products.find(p => p.id === id);
};

// CREATE Product (Admin)
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  await db.delay(800);
  const products = getDBProducts();
  
  const newProduct: Product = {
    ...productData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  
  db.set(DB_KEY, [...products, newProduct]);
  return newProduct;
};

// UPDATE Product (Admin)
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  await db.delay(600);
  const products = getDBProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) throw new Error('Product not found');
  
  const updatedProduct = { ...products[index], ...updates };
  products[index] = updatedProduct;
  
  db.set(DB_KEY, products);
  return updatedProduct;
};

// DELETE Product (Admin)
export const deleteProduct = async (id: string): Promise<void> => {
  await db.delay(500);
  const products = getDBProducts();
  const filtered = products.filter(p => p.id !== id);
  db.set(DB_KEY, filtered);
};

// Image Upload Simulation
export const uploadImage = async (file: File): Promise<string> => {
  await db.delay(1000);
  // Returns a random image for demo
  return `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
};

// Deprecated alias for backward compatibility if any legacy calls exist
export const fetchProducts = async () => (await getProducts()).data;