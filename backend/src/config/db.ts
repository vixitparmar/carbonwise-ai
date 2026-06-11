import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let useMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not defined in environment variables. Falling back to local JSON database.');
    useMongo = false;
    return false;
  }

  try {
    // Set connection timeout to 3 seconds for quick fallback check
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB successfully.');
    useMongo = true;
    return true;
  } catch (error: any) {
    console.warn(`⚠️ Failed to connect to MongoDB: ${error.message}. Falling back to local JSON database.`);
    useMongo = false;
    return false;
  }
}
