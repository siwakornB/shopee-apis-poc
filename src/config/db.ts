import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            //   useNewUrlParser: true,
            //   useUnifiedTopology: true,
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASSWORD,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if the connection fails
    }
};
