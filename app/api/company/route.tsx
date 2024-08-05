import Company from '@/modules/company';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';

export async function POST(request:Request) {
    await connectDB();

    try {
        const companyData = await request.json();
        const companyNew = new Company(companyData);
        await companyNew.save();
        return NextResponse.json({ success: true, company: companyNew });
    } catch (error) {
        return NextResponse.json({ success: false, error: error});
    }
}

export async function GET(request:Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let company;
        if (id) {
            company = await Company.findById(id);
            if (!company) throw new Error('Company not found');
        } else {
            company = await Company.find();
        }

        return NextResponse.json({ success: true, company });
    } catch (error) {
        return NextResponse.json({ success: false, error: error});
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
