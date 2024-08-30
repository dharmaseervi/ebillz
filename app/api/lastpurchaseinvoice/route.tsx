import connectDB from '@/utils/mongodbConnection';
import { NextRequest, NextResponse } from 'next/server';
import PurchaseInvoice from '@/modules/purchase';
import { getAuth } from '@clerk/nextjs/server'; // Use Clerk's method for authentication

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        // Get the authenticated user's session using Clerk
        const { userId } = getAuth(request);

        // Ensure the user is authenticated
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

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
