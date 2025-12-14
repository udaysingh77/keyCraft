import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nebula Orb',
    description: 'A handcrafted resin orb swirling with galaxy-like colors. Glows in the dark.',
    price: 24.99,
    images: ['https://picsum.photos/400/400?random=1'],
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
    images: ['https://picsum.photos/400/400?random=2'],
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
    images: ['https://picsum.photos/400/400?random=3'],
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
    images: ['https://picsum.photos/400/400?random=4'],
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
    images: ['https://picsum.photos/400/400?random=5'],
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
    images: ['https://picsum.photos/400/400?random=6'],
    stock: 20,
    category: 'Gemstone',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  }
];