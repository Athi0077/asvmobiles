import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/categoryModel.js';

dotenv.config();

const newCategories = [
  {
    name: "Android",
    slug: 'android',
    description: "Android smartphones",
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=800'
  },
  { 
    name: "Mobile Accessories",
    slug: 'mobile-accessories',
    description: "Mobile cases, headsets, chargers",
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: "Lite used Mobiles",
    slug: 'Lite used-mobiles',
    description: "Clean used/Lite used smartphones",
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: "iPhones",
    slug: 'iphones',
    description: "Modern iPhone-style smartphones",
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800'
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for initialization...');
    
    for (const cat of newCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

run();
