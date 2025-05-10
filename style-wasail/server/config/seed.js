import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = 'mongodb+srv://msarfrazbscs23seecs:GYCId0ZBYPZevozW@cluster0.kyxsg3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to DB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create users
const createUsers = async () => {
  try {
    // Create dev user
    await User.create({
      name: 'Dev User',
      email: 'dev@example.com',
      password: 'devpassword',
      role: 'user'
    });

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword',
      role: 'admin'
    });

    console.log('Users created successfully');
    process.exit();
  } catch (err) {
    console.error('Error creating users:', err);
    process.exit(1);
  }
};

createUsers(); 