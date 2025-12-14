import { User, UserRole } from '../types';
import { db } from '../lib/db';

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

// Run initialization
initDatabase();

// Helper: Simulate Bcrypt password hashing
const hashPassword = (password: string) => `hashed_${password}`;

// Helper: Simulate JWT Token Generation
const generateToken = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 3600000 // 1 hour
  };
  return `eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.mocksignature`;
};

// Login API
export const login = async (email: string, password: string): Promise<User> => {
  await db.delay(800);
  
  const users = db.get<any[]>(USERS_KEY, []);
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  };
};

// Signup API
export const register = async (name: string, email: string, password: string): Promise<User> => {
  await db.delay(1000);
  
  const users = db.get<any[]>(USERS_KEY, []);
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists with this email');
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
};