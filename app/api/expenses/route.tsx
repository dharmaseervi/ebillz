import Expense from '@/modules/expenses';
import connectDB from '../../../utils/mongodbConnection';
import { getAuth } from '@clerk/nextjs/server'; // Use Clerk's method for authentication
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    await connectDB();

    try {
        // Get the session for the current user using Clerk
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        // Fetch expenses that belong to the authenticated user
        const expenses = await Expense.find({ userId });

        // Return the filtered list of expenses
        return NextResponse.json({ success: true, expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ success: false, error: 'Error fetching expenses' });
    }
}

export async function POST(request: Request) {
    await connectDB();

    try {
        // Get the session for the current user using Clerk
        const { userId } =  getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const { amount, date, category, vendor, notes } = await request.json();

        const newExpense = new Expense({
            amount,
            date,
            category,
            vendor,
            notes,
            userId
        });

        console.log("New Expense before saving:", newExpense);  // Debug log

        await newExpense.save();
        return NextResponse.json({ success: true, expense: newExpense });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ success: false, error: 'Error creating expense' });
    }
}

export async function PUT(request: Request) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const { amount, date, category, vendor, notes } = await request.json();

        if (id) {
            const updatedExpense = await Expense.findByIdAndUpdate(id, { amount, date, category, vendor, notes }, { new: true });
            if (!updatedExpense) {
                return NextResponse.json({ success: false, error: 'Expense not found' });
            }
            return NextResponse.json({ success: true, expense: updatedExpense });
        } else {
            return NextResponse.json({ success: false, error: 'Missing expense ID' });
        }
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ success: false, error: 'Error updating expense' });
    }
}

export async function DELETE(request: Request) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (id) {
            const deletedExpense = await Expense.findByIdAndDelete(id);
            if (!deletedExpense) {
                return NextResponse.json({ success: false, error: 'Expense not found' });
            }
            return NextResponse.json({ success: true, expense: deletedExpense });
        } else {
            return NextResponse.json({ success: false, error: 'Missing expense ID' });
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ success: false, error: 'Error deleting expense' });
    }
}
