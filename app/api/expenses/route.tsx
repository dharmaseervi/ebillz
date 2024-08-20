import Expense from '@/modules/expenses';
import connectDB from '../../../utils/mongodbConnection';
import { auth } from "@/auth"
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  await connectDB();

  try {
    // Get the session for the current user
    const session: any = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'User not authenticated' });
    }

    const userId = session.user._id; // Retrieve the user ID from the session

    // Fetch expenses that belong to the authenticated user
    const expenses = await Expense.find({ userId });

    // Return the filtered list of expenses
    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);

    // Return an error response in case of failure
    return NextResponse.json({ success: false, error: 'Error fetching expenses' });
  }
}

export async function POST(request: Request) {
  await connectDB();

  const session: any = await auth();

  if (!session) {
    return NextResponse.json({ success: false, error: 'User not authenticated' });
  }

  try {
    const { amount, date, category, vendor, notes } = await request.json();
    const userId = session?.user?._id;
    const id = mongoose.Types.ObjectId.createFromHexString(userId)
    console.log(id);

    const newExpense = new Expense({
      amount,
      date,
      category,
      vendor,
      notes,
      userId:id,
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
