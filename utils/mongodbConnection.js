// utils/mongodbConnection.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        return;
    }
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
};

export default connectDB;
