import Company from '@/modules/company';
import connectDB from '@/utils/mongodbConnection';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth method

export async function POST(request: NextRequest) {
    await connectDB();

    try {
        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        // Parse the incoming company data
        const companyData = await request.json();

        // Add userId to the company data
        const companyNew = new Company({ ...companyData, userId });

        // Save the new company data with userId
        await companyNew.save();

        return NextResponse.json({ success: true, company: companyNew });
    } catch (error) {
        console.error('Error creating company:', error);
        return NextResponse.json({ success: false, error: error || 'Error creating company' });
    }
}

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

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
        return NextResponse.json({ success: false, error: error || 'Error fetching company' });
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const companyData = await request.json();

        if (!id) throw new Error('Company ID is required');

        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const updatedCompany = await Company.findOneAndUpdate({ _id: id, userId }, companyData, { new: true });
        if (!updatedCompany) throw new Error('Company not found or not authorized');

        return NextResponse.json({ success: true, company: updatedCompany });
    } catch (error) {
        console.error('Error updating company:', error);
        return NextResponse.json({ success: false, error: error || 'Error updating company' });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) throw new Error('Company ID is required');

        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const deletedCompany = await Company.findOneAndDelete({ _id: id, userId });
        if (!deletedCompany) throw new Error('Company not found or not authorized');

        return NextResponse.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Error deleting company:', error);
        return NextResponse.json({ success: false, error: error || 'Error deleting company' });
    }
}
