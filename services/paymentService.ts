import { db } from '../lib/db';
import { apiHandler } from '../lib/apiHandler';
import { AppError } from '../lib/AppError';
import { config } from '../lib/config';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export const createPaymentOrder = async (amount: number, currency: string = 'USD'): Promise<RazorpayOrder> => {
  return apiHandler(async () => {
    if (amount <= 0) throw new AppError('Invalid amount', 400);

    await db.delay(config.apiDelay); 
    
    // Simulate Razorpay Server Error randomly for testing robustness?
    // if (Math.random() < 0.05) throw new AppError('Razorpay Gateway Timeout', 503);

    return {
      id: `order_rzp_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency
    };
  });
};

export const verifyPaymentSignature = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> => {
  return apiHandler(async () => {
    await db.delay(config.apiDelay);

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new AppError('Missing payment verification parameters', 400);
    }
    
    // Logic: In real app, crypto.createHmac...
    return true;
  });
};