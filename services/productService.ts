import { Product, ProductFilterParams, PaginatedResponse } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { db } from '../lib/db';
import { config } from '../lib/config';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, productSchema, productFilterSchema } from '../lib/validation';

const DB_KEY = 'keycraft_products';

const getDBProducts = () => db.get<Product[]>(DB_KEY, INITIAL_PRODUCTS);

export const getProducts = async (params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> => {
  return apiHandler(async () => {
    validate(productFilterSchema, params);
    await db.delay(config.apiDelay);
    
    let products = getDBProducts();

    if (!params.includeInactive) {
      products = products.filter(p => p.isActive);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'All') {
      products = products.filter(p => p.category === params.category);
    }

    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const limit = params.limit || 100;
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
  });
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return apiHandler(async () => {
    await db.delay(300);
    const products = getDBProducts();
    const product = products.find(p => p.id === id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  });
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  return apiHandler(async () => {
    validate(productSchema, productData);
    await db.delay(800);
    const products = getDBProducts();
    
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    db.set(DB_KEY, [...products, newProduct]);
    return newProduct;
  });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  return apiHandler(async () => {
    await db.delay(600);
    const products = getDBProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) throw new AppError('Product not found', 404);
    
    const updatedProduct = { ...products[index], ...updates };
    
    products[index] = updatedProduct;
    
    db.set(DB_KEY, products);
    return updatedProduct;
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  return apiHandler(async () => {
    await db.delay(500);
    const products = getDBProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) throw new AppError('Product not found', 404);
    db.set(DB_KEY, filtered);
  });
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
  return apiHandler(async () => {
    if (files.length === 0) return [];
    
    // Basic validation
    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            throw new AppError(`File ${file.name} is not an image`, 400);
        }
    }
    
    await db.delay(1000 + (files.length * 200));
    
    return files.map((_, i) => 
      `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 10000) + i}`
    );
  });
};

export const uploadImage = async (file: File): Promise<string> => {
  const [url] = await uploadImages([file]);
  return url;
};