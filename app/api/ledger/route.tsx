import ledger from '@/modules/ledger';
import connectDB from '@/utils/mongodbConnection';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth"


export async function GET(request: NextRequest) {
    await connectDB();

    try {
        // Get the authenticated user's session
        const session: any = await auth();

        // Ensure the user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const userId = session.user._id; // Get the user's ID from the session
        const supplierId = request.nextUrl.searchParams.get('supplierId'); // Get supplierId from query params

        // Fetch ledger entries for the specific supplier and user
        const entries = await ledger.find({ supplierId, userId }).populate('supplierId').sort({ date: 1 });

        return NextResponse.json({ success: true, entries }, { status: 200 });
    } catch (error) {
        console.error('Error fetching ledger entries:', error);
        return NextResponse.json({ success: false, error: 'Error fetching ledger entries' }, { status: 400 });
    }
}

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const { date, particulars, vchType, vchNo, debit, credit, supplierId } = await request.json();
        const session: any = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }
        const userId = session.user._id;
        // Fetch the latest entry before the new entry's date (or equal date, if time matters)
        const previousEntry = await ledger
            .findOne({ supplierId, date: { $lte: new Date(date) } })
            .sort({ date: -1, _id: -1 });

        let previousBalance = 0;
        if (previousEntry) {
            previousBalance = previousEntry.balance;
        }

        // Calculate the new balance for the current entry
        const newBalance = previousBalance + Number(debit) - Number(credit);

        // Create the new ledger entry
        const newEntry = new ledger({
            date,
            particulars,
            vchType,
            vchNo,
            debit: Number(debit),
            credit: Number(credit),
            balance: newBalance,
            supplierId,
            userId,
        });

        await newEntry.save();

        // Now update all subsequent entries to ensure their balances are correct
        const subsequentEntries = await ledger
            .find({ supplierId, date: { $gt: new Date(date) } })
            .sort({ date: 1, _id: 1 });

        let currentBalance = newBalance;

        for (let entry of subsequentEntries) {
            currentBalance += Number(entry.debit) - Number(entry.credit);
            entry.balance = currentBalance;
            await entry.save();
        }

        return NextResponse.json({ success: true, entry: newEntry }, { status: 201 });
    } catch (error) {
        console.error('Error saving ledger entry:', error);
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    await connectDB();
    try {
        const { _id, date, particulars, vchType, vchNo, debit, credit, supplierId } = await request.json();

        // Find the entry to update
        const entryToUpdate = await ledger.findById(_id);
        if (!entryToUpdate) {
            return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
        }

        // Update entry details
        entryToUpdate.date = date;
        entryToUpdate.particulars = particulars;
        entryToUpdate.vchType = vchType;
        entryToUpdate.vchNo = vchNo;
        entryToUpdate.debit = Number(debit);
        entryToUpdate.credit = Number(credit);

        // Recalculate balance for this entry and subsequent entries
        const previousEntry = await ledger
            .findOne({ supplierId, date: { $lte: new Date(date) }, _id: { $ne: _id } })
            .sort({ date: -1, _id: -1 });

        let previousBalance = 0;
        if (previousEntry) {
            previousBalance = previousEntry.balance;
        }

        entryToUpdate.balance = previousBalance + Number(debit) - Number(credit);
        await entryToUpdate.save();

        // Update subsequent entries' balances
        const subsequentEntries = await ledger
            .find({ supplierId, date: { $gt: new Date(date) } })
            .sort({ date: 1, _id: 1 });

        let currentBalance = entryToUpdate.balance;

        for (let entry of subsequentEntries) {
            currentBalance += Number(entry.debit) - Number(entry.credit);
            entry.balance = currentBalance;
            await entry.save();
        }

        return NextResponse.json({ success: true, entry: entryToUpdate }, { status: 200 });
    } catch (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    await connectDB();
    try {
        const { id } = await request.json();

        // Find and delete the entry by ID
        const entryToDelete = await ledger.findByIdAndDelete(id);

        if (!entryToDelete) {
            return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
        }

        // Recalculate balances for subsequent entries
        const subsequentEntries = await ledger
            .find({ supplierId: entryToDelete.supplierId, date: { $gte: entryToDelete.date } })
            .sort({ date: 1, _id: 1 });

        let previousBalance = 0;
        const lastPreviousEntry = await ledger
            .findOne({ supplierId: entryToDelete.supplierId, date: { $lt: entryToDelete.date } })
            .sort({ date: -1, _id: -1 });

        if (lastPreviousEntry) {
            previousBalance = lastPreviousEntry.balance;
        }

        let currentBalance = previousBalance;

        for (let entry of subsequentEntries) {
            currentBalance += Number(entry.debit) - Number(entry.credit);
            entry.balance = currentBalance;
            await entry.save();
        }

        return NextResponse.json({ success: true, message: 'Entry deleted and balances updated' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json({ success: false, error: error }, { status: 400 });
    }
}
