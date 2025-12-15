import { AppError } from './AppError';

// Centralized error handler acting as middleware
export const apiHandler = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // 1. Log the error (Simulating server-side logging)
    console.error(`[API Error] ${new Date().toISOString()}:`, error);

    // 2. Handle known Operational Errors
    if (error instanceof AppError) {
      throw error;
    }

    // 3. Handle Joi Validation Errors (if they leak through without AppError wrapping)
    if (error.isJoi) {
      throw new AppError(error.details[0].message, 400);
    }

    // 4. Handle generic/programming errors
    throw new AppError('Internal Server Error. Please try again later.', 500);
  }
};