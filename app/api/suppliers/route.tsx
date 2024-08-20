import suppliers from '@/modules/suppliers';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import { auth } from "@/auth"


export async function GET(request: Request) {
    await connectDB();

    try {
        // Authenticate the user
        const session: any = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const userId = session.user._id; // Get the user's ID from the session
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

export async function POST(request: Request) {
    await connectDB();
    try {
        const data = await request.json();
        const session: any = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }
        const userId = session.user._id;
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
export async function PUT(request: Request) {
    await connectDB();
    try {
        const data = await request.json();
        const supplier = await suppliers.findByIdAndUpdate(data._id, data, {
            new: true,
        });
        return NextResponse.json({ success: true, supplier });
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }
}

export async function DELETE(request: Request) {
    await connectDB();
    try {
        const { id } = await request.json();
        await suppliers.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }
}
