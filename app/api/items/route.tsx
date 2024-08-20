
import connectDB from '@/utils/mongodbConnection';
import ProductDocument from '@/modules/items'
import { NextResponse } from 'next/server';
import InvoiceItem from '@/modules/InvoiceItem';
import { auth } from "@/auth"

export async function POST(request: Request) {
    await connectDB();
    const session: any = await auth();
    try {
        const userId = session?.user?._id;
        const { name, unit, hsnCode, sellingPrice, quantity, description } = await request.json();
        const item = new ProductDocument({
            name,
            unit,
            hsnCode,
            sellingPrice,
            quantity,
            description,
            userId
        });
        console.log(item);

        await item.save();
        return NextResponse.json({ success: true, items: item });
    } catch (error) {
        return NextResponse.json({ success: false, error: error });
    }

}

export async function GET(request: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const id = searchParams.get('id');

        // Get session data for the current user
        const session: any = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const userId = session.user._id; // Retrieve the userId from the session

        let filterData;
        if (search) {
            // Find products based on userId and search criteria (e.g., name or symbol)
            filterData = await ProductDocument.find({
                userId,
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Case-insensitive search for name
                    { symbol: { $regex: search, $options: 'i' } }, // Case-insensitive search for symbol
                ],
            });
        } else if (id) {
            // Find a specific product by its ID and ensure it belongs to the user
            filterData = await ProductDocument.findOne({ _id: id, userId });
        } else {
            // Fetch all products belonging to the authenticated user
            filterData = await ProductDocument.find({ userId });
        }

        return NextResponse.json({ filterData });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error fetching products' });
    }
}
export async function PUT(request: Request) {
    await connectDB();

    try {
        const { formData, updates } = await request.json(); // Adding action to determine whether to increment or decrement
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        console.log(formData ,'updates');

        if (id) {
            // Update a single item by ID
            try {
                const updatedItem = await ProductDocument.findByIdAndUpdate(id, formData, { new: true });
                if (!updatedItem) {
                    return NextResponse.json({ success: false, error: 'Item not found' });
                }
                return NextResponse.json({ success: true, item: updatedItem });
            } catch (error) {
                console.error('Error updating item:', error);
                return NextResponse.json({ success: false, error: 'Error updating item' });
            }
        }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ success: false, error: 'Invalid input format. Expected an array of updates.' });
        }

        // Batch update for both InvoiceItem and ProductDocument
        const updatePromises = updates.map(async (update) => {
            const { _id, itemId, action, ...updateData } = update;
            console.log(_id ,'_id');

            if (_id || itemId) {

                try {
                    // Update InvoiceItem
                    const updatedInvoiceItem = await InvoiceItem.findByIdAndUpdate(_id, updateData, { new: true });
                
                    // Update ProductDocument (Increment or decrement quantity)
                    const currentProduct = await ProductDocument.findById(_id || itemId);
                    console.log(currentProduct, 'current product');


                    if (currentProduct) {
                        if (updateData.quantity) {
                            console.log(updateData.quantity, 'aty');

                            if (action === 'decrement') {
                                // Decrement the quantity
                                updateData.quantity = currentProduct.quantity - updateData.quantity;
                                console.log( currentProduct.quantity , 'res');

                            } else if (action === 'increment') {
                                // Increment the quantity
                                updateData.quantity = currentProduct.quantity + updateData.quantity;
                            }

                            // Ensure quantity doesn't fall below zero
                            updateData.quantity = Math.max(updateData.quantity, 0);
                        }

                        await ProductDocument.findByIdAndUpdate(_id || itemId, updateData, { new: true });
                    }

                    return updatedInvoiceItem;
                } catch (error) {
                    console.error('Error updating item with ID:', _id, error);
                    return { success: false, error: `Error updating item with ID: ${_id}` };
                }
            } else {
                return { success: false, error: 'Missing item ID' };
            }
        });

        const results = await Promise.all(updatePromises);
        const failedUpdates = results.filter(result => result && result.success === false);

        if (failedUpdates.length > 0) {
            return NextResponse.json({ success: false, errors: failedUpdates });
        }

        return NextResponse.json({ success: true, items: results.filter(result => result && result.success !== false) });
    } catch (error) {
        console.error('Error updating items:', error);
        return NextResponse.json({ success: false, error: 'Error updating items' });
    }
}

export async function DELETE(request: Request) {
    await connectDB();

    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Product ID is required' });
        }

        const deletedProduct = await ProductDocument.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json({ success: false, error: 'Product not found' });
        }

        return NextResponse.json({ success: true, message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ success: false, error: error });
    }
}