import InvoiceItem, { IInvoiceItem } from '@/modules/InvoiceItem';
import PurchaseInvoice, { IPurchaseInvoice } from '@/modules/purchase';
import connectDB from '@/utils/mongodbConnection';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Import Clerk's getAuth method

export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const {
            purchaseOrderNumber,
            purchaseInvoiceNumber,
            supplierName,
            supplierId,
            purchaseDate,
            dueDate,
            items,
            totalAmount
        } = await request.json();

        // Get the authenticated user's session using Clerk
        const { userId } =  getAuth(request); // Pass the request to getAuth to fetch user info

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        // Ensure no duplicates by removing _id or checking if they already exist in the database
        const purchaseItems = await Promise.all(
            items.map(async (item: IInvoiceItem) => {
                const newItemData = { ...item, userId };

                // Check if item already exists, and skip creating if it does
                let existingItem = await InvoiceItem.findOne({ _id: item._id });

                if (existingItem) {
                    console.log(`Item with ID ${item._id} already exists, skipping creation.`);
                    return existingItem._id; // Return existing item ID
                }

                // If no existing item, create new
                const newItem = new InvoiceItem(newItemData);
                await newItem.save();
                return newItem._id; // Return new item ID
            })
        );

        const PurchaseOrder: IPurchaseInvoice = new PurchaseInvoice({
            invoiceNumber: purchaseInvoiceNumber,
            purchaseOrderNumber,
            supplierName,
            supplierId,
            purchaseDate: new Date(purchaseDate),
            dueDate: new Date(dueDate),
            items: purchaseItems,
            totalAmount,
            userId,
        });

        console.log(PurchaseOrder, 'purchase order created successfully');

        await PurchaseOrder.save();
        return NextResponse.json({ success: true, purchaseOrderId: PurchaseOrder._id });
    } catch (error) {
        console.error('Error creating purchase order:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error creating purchase order' });
    }
}

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        // Get the authenticated user's session using Clerk
        const { userId } =  getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        let purchaseOrderData;

        if (id) {
            // Find a specific purchase order by its ID, ensuring it belongs to the user
            purchaseOrderData = await PurchaseInvoice.findOne({ _id: id, userId }).populate('items').exec();

            if (!purchaseOrderData) {
                return NextResponse.json({ success: false, error: 'Purchase Order not found' });
            }
        } else {
            // Fetch all purchase orders belonging to the authenticated user
            purchaseOrderData = await PurchaseInvoice.find({ userId }).populate('items').exec();
        }

        return NextResponse.json({ success: true, purchaseOrders: purchaseOrderData });
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        return NextResponse.json({ success: false, error: 'Error fetching purchase order' });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' });
        }

        // Get the authenticated user's session using Clerk
        const { userId } = await getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const result = await PurchaseInvoice.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ success: false, error: 'Purchase Order not found' });
        }

        return NextResponse.json({ success: true, message: 'Purchase Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase order:', error);
        return NextResponse.json({ success: false, error: 'Error deleting purchase order' });
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        const {
            purchaseOrderNumber,
            purchaseInvoiceNumber,
            supplierName,
            supplierId,
            purchaseDate,
            dueDate,
            items = [],
            totalAmount,
        } = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' });
        }

        // Get the authenticated user's session using Clerk
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const updatePromises = items.map(async (item: any) => {
            console.log(item, 'items to updated');

            const { _id, ...itemData } = item;

            if (_id) {
                try {
                    const updatedItem = await InvoiceItem.findByIdAndUpdate(_id, itemData, { new: true });
                    console.log(updatedItem, 'updated');

                    return updatedItem;
                } catch (error) {
                    console.error('Error updating item with ID:', _id, error);
                    return { success: false, error: `Error updating item with ID: ${_id}` };
                }
            } else {
                try {
                    const newItem = new InvoiceItem(itemData);
                    console.log(newItem);

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

        const updatedPurchaseOrder = await PurchaseInvoice.findByIdAndUpdate(id, {
            invoiceNumber: purchaseOrderNumber,
            purchaseInvoiceNumber,
            supplierName,
            supplierId,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            items: items.length > 0 ? updatedItems.filter(result => result && result.success !== false) : undefined,
            totalAmount,
        }, { new: true });

        if (!updatedPurchaseOrder) {
            return NextResponse.json({ success: false, error: 'Purchase Order not found' });
        }

        return NextResponse.json({ success: true, purchaseOrder: updatedPurchaseOrder });
    } catch (error) {
        console.error('Error updating purchase order:', error);
        return NextResponse.json({ success: false, error: 'Error updating purchase order' });
    }
}
