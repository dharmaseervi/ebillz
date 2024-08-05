import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import invoice from '@/modules/invoice';

export async function GET() {
    await connectDB();

    try {
        const latestInvoice = await invoice.findOne().sort({ invoiceNumber: -1 }).exec();
        const latestInvoiceNumber = latestInvoice ? latestInvoice.invoiceNumber : 0;
        return NextResponse.json({ success: true, latestInvoiceNumber });
    } catch (error) {
        console.error('Error fetching the latest invoice number:', error);
        return NextResponse.json({ success: false, error: 'Error fetching the latest invoice number' });
    }
}
