// pages/api/customers/index.js
import connectDB from '../../../utils/mongodbConnection'
import { NextResponse } from 'next/server'
import Customer from '../../../modules/customers';

export async function POST(request) {
    await connectDB();

    try {
        const { fullName, email, phone, address, city, state, zip } = await request.json();
        console.log(fullName, email, phone, address, city, state, zip, 'hello');

        // Create a new customer instance
        const newCustomer = new Customer({
            fullName,
            email,
            phone,
            address,
            city,
            state,
            zip,
        });

        // Save the new customer to the database
        const savedCustomer = await newCustomer.save();

        return NextResponse.json({ success: true, customer: savedCustomer });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.error(new Error('Failed to create customer'));
    }
}

export async function GET(request) {
    await connectDB();

    try {
        const customers = await Customer.find();
        return NextResponse.json({ customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Error fetching customers' });
    }
}