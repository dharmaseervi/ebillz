import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import PurchaseInvoice from '@/modules/purchase';
import { auth } from "@/auth"; // Assuming you have an auth function for user authentication

export async function GET() {
    await connectDB();

    try {
        // Get the authenticated user's session
        const session = await auth();

        // Ensure the user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const userId = session.user._id; // Get the user's ID from the session

        // Fetch the latest purchase invoice for this user by sorting by purchaseOrderNumber in descending order
        const latestPurchaseInvoice = await PurchaseInvoice.findOne({ userId })
            .sort({ purchaseOrderNumber: -1 })
            .exec();

        // Determine the latest purchase invoice number, defaulting to 0 if none exist
        const latestPurchaseInvoiceNumber = latestPurchaseInvoice ? latestPurchaseInvoice.purchaseOrderNumber : 0;

        return NextResponse.json({ success: true, latestPurchaseInvoiceNumber });
    } catch (error) {
        console.error('Error fetching the latest purchase invoice number:', error);
        return NextResponse.json({ success: false, error: 'Error fetching the latest purchase invoice number' });
    }
}
