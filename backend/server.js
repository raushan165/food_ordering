const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'default';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`${SERVICE_NAME} connected to MongoDB`))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Models
const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String
});
const FoodItem = mongoose.model('FoodItem', foodSchema);

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerAddress: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Redis Connection
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// ---------------------------------------------------------------------------
// ROUTING BASED ON MICROSERVICE
// ---------------------------------------------------------------------------

// 1. MENU SERVICE
if (SERVICE_NAME === 'menu-service') {
  app.get('/api/menu', async (req, res) => {
    try {
      const cachedMenu = await redisClient.get('menu:all');
      if (cachedMenu) {
        return res.json(JSON.parse(cachedMenu));
      }
      const menu = await FoodItem.find({});
      await redisClient.set('menu:all', JSON.stringify(menu), { EX: 3600 });
      res.json(menu);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  });

  app.post('/api/menu/seed', async (req, res) => {
    const dummyData = [
      { name: 'Butter Chicken & Naan', description: 'Creamy tomato gravy with naan', price: 349, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800', category: 'Main Course' },
      { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes', price: 299, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800', category: 'Vegetarian' },
      { name: 'Hyderabadi Biryani', description: 'Aromatic basmati rice with chicken', price: 249, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800', category: 'Biryani' }
    ];
    await FoodItem.deleteMany({});
    const inserted = await FoodItem.insertMany(dummyData);
    await redisClient.del('menu:all');
    res.json({ message: 'Menu seeded', data: inserted });
  });
}

// 2. ORDER SERVICE
else if (SERVICE_NAME === 'order-service') {
  app.post('/api/orders', async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });
}

// 3. USER SERVICE
else if (SERVICE_NAME === 'user-service') {
  app.get('/api/users/profile', (req, res) => {
    // Mock user profile for the scope of this project
    res.json({ name: 'Guest User', email: 'guest@example.com', role: 'Customer' });
  });
  
  app.post('/api/users/login', (req, res) => {
    res.json({ message: 'Login successful (mock)', token: 'mock-jwt-token' });
  });
}

// Health check for all services
app.get('/health', (req, res) => {
  res.json({ service: SERVICE_NAME, status: 'Healthy' });
});

app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] Microservice running on port ${PORT}`);
});
