import mongoose from 'mongoose';
import { Product, User } from './models.js';

// Connection String
const MONGO_URI = "mongodb+srv://uday291342:McEVMe47blzFcEIT@cluster0.qpukst5.mongodb.net/keycraft?appName=Cluster0";

const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Nebula Orb',
    description: 'A handcrafted resin orb swirling with galaxy-like colors. Glows in the dark.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400'],
    stock: 15,
    category: 'Resin',
    isActive: true
  },
  {
    id: '2',
    name: 'Cyber Skull',
    description: 'Metallic finish 3D printed skull with neon accents. Perfect for cyberpunk aesthetics.',
    price: 18.50,
    images: ['https://images.unsplash.com/photo-1618423771880-2d64f0d61102?auto=format&fit=crop&q=80&w=400'],
    stock: 42,
    category: '3D Printed',
    isActive: true
  },
  {
    id: '3',
    name: 'Rustic Leather Loop',
    description: 'Genuine full-grain leather keychain with brass hardware. Ages beautifully.',
    price: 29.00,
    images: ['https://images.unsplash.com/photo-1598532163257-526437c35e36?auto=format&fit=crop&q=80&w=400'],
    stock: 100,
    category: 'Leather',
    isActive: true
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Clear existing
    await Product.deleteMany({});
    await User.deleteMany({});

    // Seed Products
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log('Products seeded');

    // Seed Admin
    await User.create({
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@keycraft.com',
      password: 'hashed_admin123',
      role: 'admin'
    });
    console.log('Admin seeded');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();