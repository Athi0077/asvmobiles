import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db.js';
import Category from './models/categoryModel.js';
import User from './models/userModel.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import priceComparisonRoutes from './routes/priceComparisonRoutes.js';
import billRoutes from './routes/billRoutes.js';
import labelTemplateRoutes from './routes/labelTemplateRoutes.js';

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1); 
}

// Connect to MongoDB
connectDB().then(async () => {
  try {
    const androidExists = await Category.findOne({ slug: 'android' });
    if (!androidExists) {
      console.log('Seeding new categories...');
      await Category.insertMany([
        { name: "Android", slug: 'android', description: "Android smartphones", image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=800' },
        { name: "Mobile Accessories", slug: 'mobile-accessories', description: "Mobile cases, headsets, chargers", image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800' },
        { name: "Lite used Mobiles", slug: 'Lite used-mobiles', description: "Clean used/Lite used smartphones", image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800' },
        { name: "iPhones", slug: 'iphones', description: "Modern iPhone-style smartphones", image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800' }
      ]);
      console.log('New categories seeded successfully!');
    }

    // Seed/Ensure Billing Admin user
    const billingEmail = (process.env.BILLING_ADMIN_EMAIL || 'admininvoice@asv.com').toLowerCase();
    const billingPass = process.env.BILLING_ADMIN_PASSWORD || 'asmininvoice123asv';
    let billingUser = await User.findOne({ email: billingEmail });

    if (!billingUser) {
      await User.create({
        name: 'ASV Billing Admin',
        email: billingEmail,
        password: billingPass,
        role: 'admin',
      });
      console.log(`Billing admin user created: ${billingEmail}`);
    } else {
      let isChanged = false;
      if (billingUser.role !== 'admin') {
        billingUser.role = 'admin';
        isChanged = true;
      }
      const isMatch = await billingUser.matchPassword(billingPass);
      if (!isMatch) {
        billingUser.password = billingPass;
        isChanged = true;
      }
      if (isChanged) {
        await billingUser.save();
        console.log(`Billing admin credentials verified/updated: ${billingEmail}`);
      }
    }
  } catch (error) {
    console.error('Database seeding error:', error);
  }
});

const app = express();

// Enable CORS early
app.use(cors());

// Security Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })); // Allow images to load from other origins
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads, increased limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/price-comparison', priceComparisonRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/label-templates', labelTemplateRoutes);

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// Trigger nodemon restart
