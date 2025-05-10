import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    
    // Log connection state
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Add connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Add disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

export default connectDB; 