import { db } from '../lib/db';
import { CartSchema, CartItem, Product } from '../types';
import { getProductById } from './productService';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, addToCartSchema } from '../lib/validation';

const CART_DB_KEY = 'keycraft_carts';

const getDBCarts = () => db.get<CartSchema[]>(CART_DB_KEY, []);

export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  return apiHandler(async () => {
    if (!userId) throw new AppError('User ID is required', 400);
    await db.delay(300);
    const carts = getDBCarts();
    const userCart = carts.find(c => c.userId === userId);

    if (!userCart || userCart.items.length === 0) return [];

    // Performance Optimization: Parallelize product fetches
    // Previously executed sequentially (N * 300ms), now concurrent (~300ms total)
    const itemPromises = userCart.items.map(async (item) => {
        try {
            const product = await getProductById(item.productId);
            if (product) {
                return {
                    ...product,
                    quantity: item.quantity,
                    price: product.price 
                } as CartItem;
            }
        } catch (e) {
            console.warn(`Product ${item.productId} in cart no longer exists.`);
            return null;
        }
        return null;
    });

    const results = await Promise.all(itemPromises);
    
    // Filter out nulls (deleted products)
    return results.filter((item): item is CartItem => item !== null);
  });
};

export const addToCart = async (userId: string, product: Product, quantity: number = 1): Promise<void> => {
  return apiHandler(async () => {
    validate(addToCartSchema, { quantity });
    if (!userId) throw new AppError('User ID required', 401);

    await db.delay(300);
    const carts = getDBCarts();
    let userCart = carts.find(c => c.userId === userId);

    if (!userCart) {
      userCart = { userId, items: [] };
      carts.push(userCart);
    }

    const existingItem = userCart.items.find(i => i.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.items.push({
        productId: product.id,
        quantity,
        price: product.price
      });
    }

    db.set(CART_DB_KEY, carts);
  });
};

export const updateCartItem = async (userId: string, productId: string, quantity: number): Promise<void> => {
  return apiHandler(async () => {
    if (!userId) throw new AppError('User ID required', 401);
    
    await db.delay(200);
    const carts = getDBCarts();
    const userCart = carts.find(c => c.userId === userId);

    if (userCart) {
      const itemIndex = userCart.items.findIndex(i => i.productId === productId);
      if (itemIndex > -1) {
        if (quantity <= 0) {
          userCart.items.splice(itemIndex, 1);
        } else {
          userCart.items[itemIndex].quantity = quantity;
        }
        db.set(CART_DB_KEY, carts);
      } else {
        throw new AppError('Item not found in cart', 404);
      }
    } else {
        throw new AppError('Cart not found', 404);
    }
  });
};

export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  return apiHandler(async () => {
      await db.delay(200);
      const carts = getDBCarts();
      const userCart = carts.find(c => c.userId === userId);

      if (userCart) {
        userCart.items = userCart.items.filter(i => i.productId !== productId);
        db.set(CART_DB_KEY, carts);
      }
  });
};

export const clearUserCart = async (userId: string): Promise<void> => {
  return apiHandler(async () => {
      await db.delay(200);
      const carts = getDBCarts();
      const userCart = carts.find(c => c.userId === userId);

      if (userCart) {
        userCart.items = [];
        db.set(CART_DB_KEY, carts);
      }
  });
};