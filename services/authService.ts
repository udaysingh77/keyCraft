import { User, UserRole } from '../types';
import { db } from '../lib/db';
import { config } from '../lib/config';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, loginSchema, registerSchema } from '../lib/validation';

const USERS_KEY = 'keycraft_users';
const API_URL = 'http://localhost:3001/api';

const hashPassword = (password: string) => `hashed_${password}`;

export const login = async (email: string, password: string): Promise<User> => {
  return apiHandler(async () => {
    validate(loginSchema, { email, password });
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Login failed');
        }
        return await res.json();
    } catch (e: any) {
        console.warn('Backend Login Failed, trying local:', e.message);
        // Fallback for demo purposes if server isn't running
        await db.delay(config.apiDelay);
        const users = db.get<any[]>(USERS_KEY, []);
        const user = users.find(u => u.email === email);
        if (!user || user.password !== hashPassword(password)) {
             throw new AppError('Invalid email or password', 401);
        }
        return { ...user, token: "local_token" };
    }
  });
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  return apiHandler(async () => {
    validate(registerSchema, { name, email, password });
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        if (!res.ok) {
             const err = await res.json();
             throw new Error(err.error || 'Registration failed');
        }
        return await res.json();
    } catch (e: any) {
        console.warn('Backend Register Failed, trying local:', e.message);
        // Fallback
        await db.delay(1000);
        const users = db.get<any[]>(USERS_KEY, []);
        if (users.find(u => u.email === email)) throw new AppError('User already exists', 409);
        
        const newUser = {
            id: `user-${Math.random().toString(36).substr(2, 9)}`,
            name, email, password: hashPassword(password), role: UserRole.CUSTOMER
        };
        db.set(USERS_KEY, [...users, newUser]);
        return { ...newUser, token: "local_token" };
    }
  });
};