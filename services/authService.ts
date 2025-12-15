import { User, UserRole } from '../types';
import { db } from '../lib/db';
import { config } from '../lib/config';
import { AppError } from '../lib/AppError';
import { apiHandler } from '../lib/apiHandler';
import { validate, loginSchema, registerSchema } from '../lib/validation';

const USERS_KEY = 'keycraft_users';

function initDatabase() {
  const users = db.get<any[]>(USERS_KEY, []);
  if (!users.find(u => u.email === 'admin@keycraft.com')) {
    db.set(USERS_KEY, [
      ...users,
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@keycraft.com',
        password: 'hashed_admin123',
        role: UserRole.ADMIN
      }
    ]);
  }
}

initDatabase();

const hashPassword = (password: string) => `hashed_${password}`;

const generateToken = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 3600000 
  };
  // Simulate JWT signing with secret from config
  return `eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.${config.jwtSecret}`;
};

export const login = async (email: string, password: string): Promise<User> => {
  return apiHandler(async () => {
    validate(loginSchema, { email, password });
    await db.delay(config.apiDelay);
    
    const users = db.get<any[]>(USERS_KEY, []);
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };
  });
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  return apiHandler(async () => {
    validate(registerSchema, { name, email, password });
    await db.delay(1000);
    
    const users = db.get<any[]>(USERS_KEY, []);
    
    if (users.find(u => u.email === email)) {
      throw new AppError('User already exists with this email', 409);
    }

    const newUser = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: hashPassword(password),
      role: UserRole.CUSTOMER
    };

    db.set(USERS_KEY, [...users, newUser]);

    const token = generateToken(newUser);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token
    };
  });
};