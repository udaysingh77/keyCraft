import { Product, ProductFilterParams, PaginatedResponse } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { db } from '../lib/db';
import { config } from '../lib/config';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, productSchema, productFilterSchema } from '../lib/validation';

const DB_KEY = 'keycraft_products';
const API_URL = 'http://localhost:3001/api';

const getDBProducts = () => db.get<Product[]>(DB_KEY, INITIAL_PRODUCTS);

export const getProducts = async (params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> => {
  return apiHandler(async () => {
    validate(productFilterSchema, params);
    try {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.includeInactive) query.append('includeInactive', 'true');
      
      const res = await fetch(`${API_URL}/products?${query.toString()}`);
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      return { data: data.data, total: data.data.length, page: 1, totalPages: 1 };
    } catch (e) {
      await db.delay(config.apiDelay);
      let products = getDBProducts();
      // ... Local filtering logic ...
      if (!params.includeInactive) products = products.filter(p => p.isActive);
      if (params.search) {
         const q = params.search.toLowerCase();
         products = products.filter(p => p.name.toLowerCase().includes(q));
      }
      if (params.category && params.category !== 'All') products = products.filter(p => p.category === params.category);
      return { data: products, total: products.length, page: 1, totalPages: 1 };
    }
  });
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return apiHandler(async () => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Backend unavailable');
        return await res.json();
    } catch (e) {
        await db.delay(300);
        return getDBProducts().find(p => p.id === id);
    }
  });
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  return apiHandler(async () => {
    validate(productSchema, productData);
    
    // Add ID and Timestamp logic here if needed by schema, but normally server handles it.
    // However, our mongoose schema expects 'id' field string.
    const payload = {
        ...productData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('API Failed');
        return await res.json();
    } catch(e) {
        console.warn("Using Local DB for Create");
        const products = getDBProducts();
        db.set(DB_KEY, [...products, payload]);
        return payload as Product;
    }
  });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  return apiHandler(async () => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updates)
        });
        if(!res.ok) throw new Error('API Failed');
        return await res.json();
    } catch(e) {
        const products = getDBProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new AppError('Product not found', 404);
        const updated = { ...products[index], ...updates };
        products[index] = updated;
        db.set(DB_KEY, products);
        return updated;
    }
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  return apiHandler(async () => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error('API Failed');
    } catch(e) {
        const products = getDBProducts();
        db.set(DB_KEY, products.filter(p => p.id !== id));
    }
  });
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  return apiHandler(async () => {
    await db.delay(1000);
    return files.map((_, i) => `https://picsum.photos/400/400?random=${Math.random()}`);
  });
};