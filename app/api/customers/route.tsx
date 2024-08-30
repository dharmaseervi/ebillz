import connectDB from '../../../utils/mongodbConnection';
import { NextResponse } from 'next/server';
import Customer from '../../../modules/customers';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    await connectDB();

    try {
        const { fullName, email, phone, address, city, state, zip } = await request.json();
        if (!fullName || !email || !phone || !address || !city || !state || !zip) {
            return NextResponse.json({ success: false, error: 'Missing required fields' });
        }

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        // Create a new customer instance
        const newCustomer = new Customer({
            fullName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            userId
        });

        // Save the new customer to the database
        const savedCustomer = await newCustomer.save();

        return NextResponse.json({ success: true, customer: savedCustomer });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to create customer' });
    }
}

export async function GET(request: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const id = searchParams.get('id');

        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        let customers;

        if (id) {
            // Fetch customer by ID and ensure it belongs to the logged-in user
            customers = await Customer.findOne({ _id: id, userId });
        } else if (search) {
            // Perform a search query on customers that belong to the logged-in user
            customers = await Customer.find({
                userId,
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ]
            });
        } else {
            // Fetch all customers that belong to the logged-in user
            customers = await Customer.find({ userId });
        }

        if (!customers) {
            return NextResponse.json({ success: false, error: 'No customers found' });
        }

        return NextResponse.json({ success: true, customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ success: false, error: 'Error fetching customers' });
    }
}

export async function PUT(request: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Customer ID is required' });
        }

        const { fullName, email, phone, address, city, state, zip } = await request.json();
        if (!fullName || !email || !phone || !address || !city || !state || !zip) {
            return NextResponse.json({ success: false, error: 'Missing required fields' });
        }

        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { fullName, email, phone, address, city, state, zip },
            { new: true }
        );

        if (!updatedCustomer) {
            return NextResponse.json({ success: false, error: 'Customer not found' });
        }

        return NextResponse.json({ success: true, customer: updatedCustomer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to update customer' });
    }
}

export async function DELETE(request: Request) {
    await connectDB();

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, error: 'Customer ID is required' });
        }

        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const deletedCustomer = await Customer.findByIdAndDelete(id);

        if (!deletedCustomer) {
            return NextResponse.json({ success: false, error: 'Customer not found' });
        }

        return NextResponse.json({ success: true, customer: deletedCustomer });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete customer' });
    }
}
