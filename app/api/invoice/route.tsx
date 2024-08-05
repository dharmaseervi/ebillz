import invoice, { IInvoice } from '@/modules/invoice';
import InvoiceItem, { IInvoiceItem } from '@/modules/InvoiceItem';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    await connectDB();

    try {
        const { invoiceNumber, customerName, customerId, invoiceDate, dueDate, items, totalAmount } = await request.json();

        const invoiceItems = await Promise.all(
            items.map(async (item: IInvoiceItem) => {
                const newItem = new InvoiceItem(item);
                await newItem.save();
                return newItem._id;
            })
        );

        const Invoice: IInvoice = new invoice({
            invoiceNumber,
            customerName,
            customerId,
            invoiceDate: new Date(invoiceDate),
            dueDate: new Date(dueDate),
            items: invoiceItems,
            totalAmount
        });
        await Invoice.save();
        return NextResponse.json({ success: true, invoiceId: Invoice._id });
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }

}

export async function GET(request: Request) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        console.log(id, 'ids');

        if (!id) {
            const invoiceData = await invoice.find()
            return NextResponse.json({ success: true, invoice: invoiceData });
        }

        const invoiceData = await invoice.findById(id).populate('items').exec();

        if (!invoiceData) {
            return NextResponse.json({ success: false, error: 'Invoice not found' });
        }

        return NextResponse.json({ success: true, invoice: invoiceData });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ success: false, error: 'Error fetching invoice' });
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
