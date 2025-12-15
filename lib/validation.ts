import Joi from 'joi';
import { AppError } from './AppError';

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error } = schema.validate(data, { abortEarly: true, stripUnknown: true });
  if (error) {
    // 400 Bad Request
    throw new AppError(error.details[0].message, 400);
  }
};

// Auth Schemas
export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().label('Email'),
  password: Joi.string().min(6).required().label('Password')
});

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().label('Name'),
  email: Joi.string().email({ tlds: { allow: false } }).required().label('Email'),
  password: Joi.string().min(6).required().label('Password')
});

// Product Schemas
export const productSchema = Joi.object({
  name: Joi.string().required().min(3),
  description: Joi.string().required().min(10),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().required(),
  isActive: Joi.boolean().required(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

export const productFilterSchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('').optional(),
  category: Joi.string().optional(),
  includeInactive: Joi.boolean().optional()
});

// Cart/Order Schemas
export const addToCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

export const addressSchema = Joi.object({
  fullName: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required()
});

export const createOrderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().min(1).required(),
  totalAmount: Joi.number().positive().required(),
  address: addressSchema.required()
});