import Company from '@/modules/company';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import { auth } from "@/auth"


export async function POST(request: Request) {
    await connectDB();

    // Get the session for the current user
    const session = await auth();
    
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'User not authenticated' });
    }

    try {
        // Parse the incoming company data
        const companyData = await request.json();

        // Add userId to the company data
        const userId = session.user._id;
        const companyNew = new Company({ ...companyData, userId });

        // Save the new company data with userId
        await companyNew.save();

        return NextResponse.json({ success: true, company: companyNew });
    } catch (error) {
        console.error('Error creating company:', error);
        return NextResponse.json({ success: false, error: error});
    }
}

export async function GET(request: Request) {
    await connectDB();

    // Get the session for the current user
    const session = await auth();
    
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'User not authenticated' });
    }

    const userId = session.user._id;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let company;
        if (id) {
            // Fetch the specific company by its ID and userId
            company = await Company.findOne({ _id: id, userId });
            if (!company) throw new Error('Company not found or not authorized');
        } else {
            // Fetch all companies belonging to the logged-in user
            company = await Company.find({ userId });
        }

        return NextResponse.json({ success: true, company });
    } catch (error) {
        console.error('Error fetching company:', error);
        return NextResponse.json({ success: false, error: error });
    }
}


export async function PUT(request:Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const companyData = await request.json();

        if (!id) throw new Error('Company ID is required');

        const updatedCompany = await Company.findByIdAndUpdate(id, companyData, { new: true });
        if (!updatedCompany) throw new Error('Company not found');

        return NextResponse.json({ success: true, company: updatedCompany });
    } catch (error) {
        return NextResponse.json({ success: false, error: error});
    }
}

export async function DELETE(request:Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) throw new Error('Company ID is required');

        const deletedCompany = await Company.findByIdAndDelete(id);
        if (!deletedCompany) throw new Error('Company not found');

        return NextResponse.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error});
    }
}
