import connectDB from '../../../utils/mongodbConnection'
import { NextResponse } from 'next/server'
import Customer from '../../../modules/customers';

export async function POST(request) {
    await connectDB();

    try {
        const { fullName, email, phone, address, city, state, zip } = await request.json();
        console.log(fullName, email, phone, address, city, state, zip);

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
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const id = searchParams.get('id');

        let customers;

        if (id) {
            customers = await Customer.findById(id);
            console.log(customers, 'ids');

        } else if (search) {
            customers = await Customer.find({
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ]
            });
        } else {
            customers = await Customer.find();
        }
        return NextResponse.json({ customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Error fetching customers' });
    }
}

export async function PUT(request) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    try {
        const {  fullName, email, phone, address, city, state, zip } = await request.json();
        console.log( fullName, email, phone, address, city, state, zip);

        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { fullName, email, phone, address, city, state, zip },
            { new: true }
        );

        if (!updatedCustomer) {
            return NextResponse.error(new Error('Customer not found'));
        }

        return NextResponse.json({ success: true, customer: updatedCustomer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.error(new Error('Failed to update customer'));
    }
}

export async function DELETE(request) {
    await connectDB();

    try {
        const { id } = await request.json();
        console.log(id);

        const deletedCustomer = await Customer.findByIdAndDelete(id);

        if (!deletedCustomer) {
            return NextResponse.error(new Error('Customer not found'));
        }

        return NextResponse.json({ success: true, customer: deletedCustomer });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.error(new Error('Failed to delete customer'));
    }
}
