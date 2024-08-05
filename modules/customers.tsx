// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String },
//     address: { type: String },
//     city: { type: String },
//     state: { type: String },
//     zip: { type: Number },
//     createdAt: { type: Date, default: Date.now }
// });

// const Customer = mongoose.models?.Customer || mongoose.model('Customer', customerSchema);

// export default Customer;
import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for the Customer document
export interface ICustomer extends Document {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: number;
    createdAt?: Date;
}

// Define the Customer schema
const customerSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

