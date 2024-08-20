import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import invoice from '@/modules/invoice';
import { auth } from "@/auth"; // Assuming you have an auth function

export async function GET(request: Request) {
    await connectDB();

    try {
        // Get the authenticated user
        const session: any = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const userId = session.user._id;
        // Get the user's invoices sorted by invoiceNumber in descending order
        const latestInvoice = await invoice.findOne({ userId }).sort({ invoiceNumber: -1 }).exec();

        // Handle if no invoices are found
        const latestInvoiceNumber = latestInvoice ? latestInvoice.invoiceNumber : 0;

        return NextResponse.json({ success: true, latestInvoiceNumber });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ success: false, error: 'Error fetching invoices' });
    }
}
