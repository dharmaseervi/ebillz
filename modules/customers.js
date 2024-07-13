import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.models?.Customer || mongoose.model('Customer', customerSchema);

export default Customer;
