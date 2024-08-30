import suppliers from '@/modules/suppliers';
import connectDB from '@/utils/mongodbConnection';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth method

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request); // Pass the request to getAuth to fetch user info

        // Ensure the user is authenticated
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const id = searchParams.get('id');
        let supplier;

        // Filter suppliers by userId and any other criteria like id or search
        if (id) {
            supplier = await suppliers.findOne({ _id: id, userId }); // Filter by userId and id
        } else if (search) {
            supplier = await suppliers.find({
                userId, // Filter by userId
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ]
            });
        } else {
            supplier = await suppliers.find({ userId }); // Fetch all suppliers for the user
        }

        return NextResponse.json({ success: true, supplier });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json({ success: false, error: 'Error fetching suppliers' });
    }
}

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const data = await request.json();
        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const newSupplier = new suppliers({ ...data, userId }); // Ensure you are using the correct model
        console.log(newSupplier, 'supplier data before saving');

        await newSupplier.save(); // Save the supplier to the database
        console.log(newSupplier, 'supplier data saved');

        return NextResponse.json({ success: true, supplier: newSupplier });
    } catch (error) {
        console.error('Error saving supplier:', error); // Log the error for better debugging
        return NextResponse.json({ success: false, error: error });
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();
    try {
        const data = await request.json();
        // Update the supplier
        const supplier = await suppliers.findByIdAndUpdate(data._id, data, { new: true });
        return NextResponse.json({ success: true, supplier });
    } catch (error) {
        console.error('Error updating supplier:', error);
        return NextResponse.json({ success: false, error: error });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const { id } = await request.json();
        // Delete the supplier
        await suppliers.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json({ success: false, error: error });
    }
}
