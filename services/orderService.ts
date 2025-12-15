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

const getDBOrders = () => db.get<Order[]>(ORDERS_KEY, []);

export const createPendingOrder = async (
  userId: string,
  clientItems: CartItem[],
  clientTotalAmount: number, // We receive this but we will verify it
  address: Address
): Promise<Order> => {
  return apiHandler(async () => {
    // Input validation
    validate(createOrderSchema, { userId, items: clientItems, totalAmount: clientTotalAmount, address });
    
    await db.delay(config.apiDelay);

    // 1. Security: Re-fetch products to get authoritative price and check stock
    // We do NOT trust the price sent from the client.
    let calculatedTotal = 0;
    const verifiedItems: OrderItem[] = [];

    // Use Promise.all for parallel verification
    const verificationPromises = clientItems.map(async (clientItem) => {
      const product = await productService.getProductById(clientItem.id);
      
      if (!product) {
        throw new AppError(`Product ${clientItem.name} (ID: ${clientItem.id}) not found`, 404);
      }
      
      if (!product.isActive) {
        throw new AppError(`Product ${product.name} is no longer available`, 409);
      }

      if (product.stock < clientItem.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 409);
      }

      return {
        product,
        quantity: clientItem.quantity
      };
    });

    const results = await Promise.all(verificationPromises);

    // 2. Build the verified order object
    for (const result of results) {
      const itemTotal = result.product.price * result.quantity;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        productId: result.product.id,
        quantity: result.quantity,
        price: result.product.price, // Use DB price
        name: result.product.name,
        image: result.product.images[0]
      });
    }

    // Optional: Compare calculatedTotal with clientTotalAmount and warn if significant difference?
    // For now, we simply use the authoritative calculatedTotal.

    // 3. Create Order Record
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      items: verifiedItems,
      totalAmount: parseFloat(calculatedTotal.toFixed(2)), // Ensure float precision
      paymentStatus: 'pending',
      orderStatus: 'processing',
      paymentId: '', 
      address,
      createdAt: new Date().toISOString()
    };

    const orders = getDBOrders();
    db.set(ORDERS_KEY, [...orders, newOrder]);

    return newOrder;
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
    if (!orderId) throw new AppError('Order ID required', 400);
    
    await db.delay(600);
    
    // 1. Verify Payment Signature
    const isValid = await paymentService.verifyPaymentSignature(
      paymentDetails.razorpayOrderId,
      paymentDetails.razorpayPaymentId,
      paymentDetails.razorpaySignature
    );

    const orders = getDBOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new AppError('Order not found', 404);

    const order = orders[index];

    // Idempotency check: If already paid, just return
    if (order.paymentStatus === 'completed') {
        return order;
    }

    if (!isValid) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      db.set(ORDERS_KEY, orders);
      throw new AppError('Payment verification failed', 402);
    }

    // 2. Atomic-ish Stock Deduction
    // We check ALL items for stock before deducting ANY to prevent partial updates
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (!product || product.stock < item.quantity) {
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled'; 
        db.set(ORDERS_KEY, orders);
        // In a real scenario, we might trigger a refund here automatically
        throw new AppError(`Stock error for ${item.name} during finalization. Order cancelled.`, 409);
      }
    }

    // Perform the deductions
    // Note: Since we are in a single-threaded mock env, the risk of race condition between 
    // the check above and this write is minimal, but in real DB use transactions.
    const deductionPromises = order.items.map(async (item) => {
        const product = await productService.getProductById(item.productId);
        if (product) {
            await productService.updateProduct(product.id, {
                stock: product.stock - item.quantity
            });
        }
    });

    await Promise.all(deductionPromises);

    // 3. Update Order Status
    order.paymentStatus = 'completed';
    order.paymentId = paymentDetails.razorpayPaymentId;
    db.set(ORDERS_KEY, orders);

    // 4. Clear Cart
    await cartService.clearUserCart(order.userId);

    return order;
  });
};

export const placeOrder = async () => { throw new AppError("Use createPendingOrder and finalizeOrder", 410); };

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return apiHandler(async () => {
    await db.delay(400);
    const orders = getDBOrders();
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  return apiHandler(async () => {
    await db.delay(400);
    const orders = getDBOrders();
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
};

export const updateOrderStatus = async (orderId: string, status: Order['orderStatus']): Promise<Order> => {
  return apiHandler(async () => {
    await db.delay(300);
    const orders = getDBOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) throw new AppError('Order not found', 404);
    
    orders[index].orderStatus = status;
    db.set(ORDERS_KEY, orders);
    
    return orders[index];
  });
};