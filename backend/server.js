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

// ---------------------------------------------------------------------------
// MONGODB CONNECTION & SCHEMAS
// ---------------------------------------------------------------------------
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`[${SERVICE_NAME}] Connected to MongoDB`))
  .catch(err => console.error('MongoDB error:', err));

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Customer' } // 'Customer' or 'Admin'
});
const User = mongoose.model('User', userSchema);

// 2. Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// 3. Food Menu Schema
const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String
});
const FoodItem = mongoose.model('FoodItem', foodSchema);

// 4. Order Schema
const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  customerName: String,
  customerAddress: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'Pending' }, // Pending, Preparing, Delivered
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Redis Connection
const redisClient = createClient({ url: REDIS_URL });
redisClient.on('error', err => console.error('Redis Error', err));
redisClient.connect().catch(console.error);


// ---------------------------------------------------------------------------
// SERVICE 1: USER SERVICE
// ---------------------------------------------------------------------------
if (SERVICE_NAME === 'user-service') {
  
  // Register Route
  app.post('/api/users/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });
      
      const role = email.includes('admin') ? 'Admin' : 'Customer';
      const user = new User({ name, email, password, role });
      await user.save();
      
      res.status(201).json({ message: 'Registered successfully', user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login Route
  app.post('/api/users/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, password });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      
      res.json({ message: 'Login successful', user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Submit Feedback Route
  app.post('/api/users/feedback', async (req, res) => {
    try {
      const feedback = new Feedback(req.body);
      await feedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Get All Feedbacks (For Admin)
  app.get('/api/users/feedback', async (req, res) => {
    try {
      const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
      res.json(feedbacks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });
}

// ---------------------------------------------------------------------------
// SERVICE 2: MENU SERVICE
// ---------------------------------------------------------------------------
else if (SERVICE_NAME === 'menu-service') {
  app.get('/api/menu', async (req, res) => {
    try {
      const cachedMenu = await redisClient.get('menu:all');
      if (cachedMenu) return res.json(JSON.parse(cachedMenu));
      
      const menu = await FoodItem.find({});
      await redisClient.set('menu:all', JSON.stringify(menu), { EX: 3600 });
      res.json(menu);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  });

  app.post('/api/menu/seed', async (req, res) => {
    const dummyData = [
      { name: 'Butter Chicken & Naan', description: 'Creamy tomato gravy with naan', price: 349, imageUrl: '/masala_dosa.png', category: 'Main Course' }, // Placeholder image
      { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes', price: 299, imageUrl: '/masala_dosa.png', category: 'Vegetarian' },
      { name: 'Masala Dosa', description: 'Crispy rice crepe filled with potato', price: 149, imageUrl: '/masala_dosa.png', category: 'South Indian' }
    ];
    await FoodItem.deleteMany({});
    const inserted = await FoodItem.insertMany(dummyData);
    await redisClient.del('menu:all');
    res.json({ message: 'Menu seeded', data: inserted });
  });
}

// ---------------------------------------------------------------------------
// SERVICE 3: ORDER SERVICE
// ---------------------------------------------------------------------------
else if (SERVICE_NAME === 'order-service') {
  
  // Place new order
  app.post('/api/orders', async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  // Get orders by user email (For Customer History)
  app.get('/api/orders/history/:email', async (req, res) => {
    try {
      const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order history' });
    }
  });

  // Get ALL orders (For Admin Dashboard)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch all orders' });
    }
  });

  // Update order status (For Admin Dashboard)
  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      res.json({ message: 'Status updated', order: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });
}

// Health check
app.get('/health', (req, res) => res.json({ service: SERVICE_NAME, status: 'Healthy' }));

app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] Microservice running on port ${PORT}`);
});
