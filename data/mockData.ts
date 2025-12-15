import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nebula Orb',
    description: 'A handcrafted resin orb swirling with galaxy-like colors. Glows in the dark.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400'],
    stock: 15,
    category: 'Resin',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Cyber Skull',
    description: 'Metallic finish 3D printed skull with neon accents. Perfect for cyberpunk aesthetics.',
    price: 18.50,
    images: ['https://images.unsplash.com/photo-1618423771880-2d64f0d61102?auto=format&fit=crop&q=80&w=400'],
    stock: 42,
    category: '3D Printed',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Rustic Leather Loop',
    description: 'Genuine full-grain leather keychain with brass hardware. Ages beautifully.',
    price: 29.00,
    images: ['https://images.unsplash.com/photo-1598532163257-526437c35e36?auto=format&fit=crop&q=80&w=400'],
    stock: 100,
    category: 'Leather',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Pixel Heart',
    description: 'Acrylic pixel art heart. Durable and lightweight.',
    price: 12.00,
    images: ['https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?auto=format&fit=crop&q=80&w=400'],
    stock: 8,
    category: 'Acrylic',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Miniature Katana',
    description: 'Detailed metal alloy replica of a katana. Dull edge for safety.',
    price: 35.00,
    images: ['https://images.unsplash.com/photo-1613535900593-9c59573887c9?auto=format&fit=crop&q=80&w=400'],
    stock: 5,
    category: 'Metal',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '6',
    name: 'Crystal Shard',
    description: 'Natural quartz crystal wire-wrapped in copper.',
    price: 22.00,
    images: ['https://images.unsplash.com/photo-1563823267-33d3c8c64222?auto=format&fit=crop&q=80&w=400'],
    stock: 20,
    category: 'Gemstone',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '7',
    name: 'Retro Game Controller',
    description: 'Classic console controller replica in silicone.',
    price: 9.99,
    images: ['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400'],
    stock: 150,
    category: 'Silicone',
    isActive: true,
    createdAt: '2023-02-15T00:00:00.000Z'
  },
  {
    id: '8',
    name: 'Brass Compass',
    description: 'Working miniature compass in solid brass casing.',
    price: 45.00,
    images: ['https://images.unsplash.com/photo-1628151016023-b1d5966601f0?auto=format&fit=crop&q=80&w=400'],
    stock: 12,
    category: 'Metal',
    isActive: true,
    createdAt: '2023-03-10T00:00:00.000Z'
  }
];