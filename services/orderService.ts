import { db } from '../lib/db';
import { Order, CartItem, Address, OrderItem } from '../types';
import * as productService from './productService';
import * as cartService from './cartService';
import * as paymentService from './paymentService';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, createOrderSchema } from '../lib/validation';
import { config } from '../lib/config';

const ORDERS_KEY = 'keycraft_orders';
const API_URL = 'http://localhost:3001/api';

const getDBOrders = () => db.get<Order[]>(ORDERS_KEY, []);

export const createPendingOrder = async (
  userId: string,
  clientItems: CartItem[],
  clientTotalAmount: number,
  address: Address
): Promise<Order> => {
  return apiHandler(async () => {
    validate(createOrderSchema, { userId, items: clientItems, totalAmount: clientTotalAmount, address });
    
    // 1. Prepare Verified Items (Logic shared between FE verify and BE verify)
    // We assume backend will re-verify, but for this architecture we construct the order payload here
    let calculatedTotal = 0;
    const verifiedItems: OrderItem[] = [];

    const verificationPromises = clientItems.map(async (clientItem) => {
      const product = await productService.getProductById(clientItem.id);
      if (!product || !product.isActive || product.stock < clientItem.quantity) {
        throw new AppError(`Issue with product ${clientItem.name}`, 409);
      }
      return { product, quantity: clientItem.quantity };
    });

    const results = await Promise.all(verificationPromises);

    for (const result of results) {
      calculatedTotal += result.product.price * result.quantity;
      verifiedItems.push({
        productId: result.product.id,
        quantity: result.quantity,
        price: result.product.price,
        name: result.product.name,
        image: result.product.images[0]
      });
    }

    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      items: verifiedItems,
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
      paymentStatus: 'pending',
      orderStatus: 'processing',
      paymentId: '', 
      address,
      createdAt: new Date().toISOString()
    };

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newOrder)
        });
        if(!res.ok) throw new Error('Backend failed');
        return await res.json();
    } catch (e) {
        console.warn("Using Local DB for Order Create");
        const orders = getDBOrders();
        db.set(ORDERS_KEY, [...orders, newOrder]);
        return newOrder;
    }
  });
};

export const finalizeOrder = async (
  orderId: string,
  paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
): Promise<Order> => {
  return apiHandler(async () => {
    // 1. Verify Payment locally or via service
    const isValid = await paymentService.verifyPaymentSignature(
      paymentDetails.razorpayOrderId,
      paymentDetails.razorpayPaymentId,
      paymentDetails.razorpaySignature
    );
    if (!isValid) throw new AppError('Invalid Payment', 400);

    try {
        const res = await fetch(`${API_URL}/orders/${orderId}/finalize`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ paymentId: paymentDetails.razorpayPaymentId })
        });
        if(!res.ok) throw new Error('Backend failed');
        
        const order = await res.json();
        // Clear cart after success
        await cartService.clearUserCart(order.userId);
        return order;

    } catch (e) {
        console.warn("Using Local DB for Finalize");
        const orders = getDBOrders();
        const order = orders.find(o => o.id === orderId);
        if(!order) throw new AppError('Order not found', 404);
        
        order.paymentStatus = 'completed';
        order.paymentId = paymentDetails.razorpayPaymentId;
        
        // Deduct stock locally
        for (const item of order.items) {
           const p = await productService.getProductById(item.productId);
           if(p) await productService.updateProduct(p.id, { stock: p.stock - item.quantity });
        }
        
        db.set(ORDERS_KEY, orders);
        await cartService.clearUserCart(order.userId);
        return order;
    }
  });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return apiHandler(async () => {
    try {
        const res = await fetch(`${API_URL}/orders?userId=${userId}`);
        if(!res.ok) throw new Error('Backend unavailable');
        return await res.json();
    } catch(e) {
        await db.delay(400);
        return getDBOrders().filter(o => o.userId === userId);
    }
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  return getUserOrders(''); // Admin fetches all
};