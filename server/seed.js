import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('Super admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'Owner',
      email: 'owner@restaurant.com',
      password: 'password123',
      role: 'superadmin',
    });

    console.log('Super admin created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
