import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import Invoice from '@/modules/invoice'; // Ensure this is the correct import for your invoice model
import { getAuth } from '@clerk/nextjs/server'; // Use Clerk's method for getting auth

export async function GET(request: Request) {
    await connectDB();

    try {
        // Get user session from Clerk
        const { userId } = await getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        // Get the user's invoices sorted by invoiceNumber in descending order
        const latestInvoice = await Invoice.findOne({ userId }).sort({ invoiceNumber: -1 }).exec();

        // Handle if no invoices are found
        const latestInvoiceNumber = latestInvoice ? latestInvoice.invoiceNumber : 0;

        return NextResponse.json({ success: true, latestInvoiceNumber });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ success: false, error: 'Error fetching invoices' });
    }
}
