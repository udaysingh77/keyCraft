import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { User, Product, Order } from './models.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://uday291342:McEVMe47blzFcEIT@cluster0.qpukst5.mongodb.net/keycraft?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Helper ---
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Routes ---

// 1. PRODUCTS

// Get All
app.get('/api/products', asyncHandler(async (req, res) => {
  const { category, search, includeInactive } = req.query;
  let query = {};

  if (includeInactive !== 'true') {
    query.isActive = true;
  }
  if (category && category !== 'All') {
    query.category = category;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json({ data: products });
}));

// Get One
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

// Create (Admin)
app.post('/api/products', asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
}));

// Update (Admin)
app.put('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}));

// Delete (Admin)
app.delete('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.params.id });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Deleted successfully' });
}));


// 2. AUTH

// Login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || user.password !== `hashed_${password}`) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: "mock_jwt_token_from_server"
  });
}));

// Register
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const newUser = new User({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    password: `hashed_${password}`,
    role: 'customer'
  });

  await newUser.save();

  res.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    token: "mock_jwt_token_from_server"
  });
}));


// 3. ORDERS

// Create Pending Order
app.post('/api/orders', asyncHandler(async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(order);
}));

// Finalize Order (Mock Payment verification)
app.post('/api/orders/:id/finalize', asyncHandler(async (req, res) => {
  const { paymentId } = req.body;
  const order = await Order.findOne({ id: req.params.id });
  
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Update Stock
  for (const item of order.items) {
    const product = await Product.findOne({ id: item.productId });
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  order.paymentStatus = 'completed';
  order.orderStatus = 'processing';
  order.paymentId = paymentId;
  await order.save();

  res.json(order);
}));

// Get Orders (User History)
app.get('/api/orders', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const query = userId ? { userId } : {}; // If no userId, admin sees all (simplified)
  
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
}));


// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});