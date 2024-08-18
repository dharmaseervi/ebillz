import invoice, { IInvoice } from '@/modules/invoice';
import InvoiceItem, { IInvoiceItem } from '@/modules/InvoiceItem';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';
import { auth } from "@/auth"
import mongoose from 'mongoose';
// Helper function to parse date from DD/MM/YYYY to YYYY-MM-DD
function parseDate(dateString: string) {
    const [day, month, year] = dateString.split('/');
    // Log if dateString is invalid
    if (!day || !month || !year) {
        console.log('Invalid date string:', dateString);
        return null;
    }
    // Returns the formatted date in YYYY-MM-DD
    return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
    await connectDB();

    try {
        const { invoiceNumber, customerName, customerId, invoiceDate, dueDate, items, totalAmount } = await request.json();

        const parsedInvoiceDate = parseDate(invoiceDate);

        // Get session data
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const userId = session?.user?._id;
        const id = mongoose.Types.ObjectId.createFromHexString(userId)


        console.log(id, 'from user id to invoice');

        // Validate invoiceDate
        if (!parsedInvoiceDate || isNaN(new Date(parsedInvoiceDate).getTime())) {
            return NextResponse.json({ success: false, error: 'Invalid invoice date format' });
        }

        // Validate dueDate
        const parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
            return NextResponse.json({ success: false, error: 'Invalid due date format' });
        }

        // Save each item and store its ID
        const invoiceItems = await Promise.all(
            items.map(async (item: IInvoiceItem) => {
                const newItem = new InvoiceItem({ ...item, userId });
                await newItem.save();
                return newItem._id;
            })
        );

        // Create new invoice with userId
        const newInvoice: IInvoice = new invoice({
            invoiceNumber,
            customerName,
            customerId,
            invoiceDate: new Date(parsedInvoiceDate),
            dueDate: parsedDueDate,
            items: invoiceItems,
            totalAmount,
            userId: id
        });

        // Save the invoice
        await newInvoice.save();

        return NextResponse.json({ success: true, invoiceId: newInvoice._id });
    } catch (error) {
        console.error('Error saving invoice:', error);
        return NextResponse.json({ success: false, error: error });
    }
}

export async function GET(request: Request) {
    await connectDB();

    // Get session data
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'User not authenticated' });
    }

    const userId = session?.user?._id;
    const id = new URL(request.url).searchParams.get('id');
    let invoices;

    try {
        if (id) {
            // Fetch a specific invoice for the logged-in user by userId and invoiceId
            invoices = await invoice
                .findOne({ _id: id, userId })
                .populate('customerId')
                .populate('items')
                .exec();

            if (!invoices) {
                return NextResponse.json({ success: false, message: 'Invoice not found or not authorized' });
            }
        } else {
            // Fetch all invoices for the logged-in user
            invoices = await invoice
                .find({ userId })
                .populate('customerId')
                .populate('items')
                .exec();
        }

        return NextResponse.json({ success: true, invoice: invoices });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ success: false, message: 'Error fetching invoice' });
    }
}



export async function DELETE(request: Request) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' });
        }
        const result = await invoice.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ success: false, error: 'Invoice not found' });
        }
        return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({ success: false, error: 'Error deleting invoice' });
    }
}

export async function PUT(request: Request) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const {
            invoiceNumber,
            customerName,
            customerId,
            invoiceDate,
            dueDate,
            items = [],
            invoiceStatus,
            totalAmount,
        } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' });
        }

        const updatePromises = items.map(async (item: any) => {
            const { _id, ...itemData } = item;

            if (_id) {
                // Update existing item
                try {
                    const updatedItem = await InvoiceItem.findByIdAndUpdate(_id, itemData, { new: true });
                    return updatedItem;
                } catch (error) {
                    console.error('Error updating item with ID:', _id, error);
                    return { success: false, error: `Error updating item with ID: ${_id}` };
                }
            } else {
                // Create new item
                try {
                    const newItem = new InvoiceItem(itemData);
                    await newItem.save();
                    return newItem;
                } catch (error) {
                    console.error('Error creating new item:', error);
                    return { success: false, error: 'Error creating new item.' };
                }
            }
        });

        const updatedItems = await Promise.all(updatePromises);
        const failedUpdates = updatedItems.filter(result => result && result.success === false);

        if (failedUpdates.length > 0) {
            return NextResponse.json({ success: false, errors: failedUpdates });
        }

        const updatedInvoice = await invoice.findByIdAndUpdate(id, {
            invoiceNumber,
            customerName,
            customerId,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            items: items.length > 0 ? updatedItems.filter(result => result && result.success !== false) : undefined,
            invoiceStatus,
            totalAmount,
        }, { new: true });

        if (!updatedInvoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' });
        }

        return NextResponse.json({ success: true, invoice: updatedInvoice });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ success: false, error: 'Error updating invoice' });
    }
}
