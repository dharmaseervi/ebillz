import connectDB from '@/utils/mongodbConnection';
import ProductDocument from '@/modules/items';
import InvoiceItem from '@/modules/InvoiceItem';
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    await connectDB();
    
    try {
        // Get user session from Clerk
        const { userId } = await getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

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
        
        await item.save();
        return NextResponse.json({ success: true, items: item });
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json({ success: false, error: 'Error creating item' });
    }
}

export async function GET(request: Request) {
    await connectDB();

    try {
        // Get user session from Clerk
        const { userId } = await getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not authenticated' });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const id = searchParams.get('id');

        let filterData;
        if (search) {
            filterData = await ProductDocument.find({
                userId,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { symbol: { $regex: search, $options: 'i' } }
                ]
            });
        } else if (id) {
            filterData = await ProductDocument.findOne({ _id: id, userId });
        } else {
            filterData = await ProductDocument.find({ userId });
        }

        return NextResponse.json({ filterData });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, error: 'Error fetching products' });
    }
}

export async function PUT(request: Request) {
    await connectDB();

    try {
        const { formData, updates } = await request.json();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (id) {
            const updatedItem = await ProductDocument.findByIdAndUpdate(id, formData, { new: true });
            if (!updatedItem) {
                return NextResponse.json({ success: false, error: 'Item not found' });
            }
            return NextResponse.json({ success: true, item: updatedItem });
        }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ success: false, error: 'Invalid input format. Expected an array of updates.' });
        }

        const updatePromises = updates.map(async (update) => {
            const { _id, itemId, action, ...updateData } = update;

            if (_id || itemId) {
                try {
                    const updatedInvoiceItem = await InvoiceItem.findByIdAndUpdate(_id, updateData, { new: true });

                    const currentProduct = await ProductDocument.findById(_id || itemId);

                    if (currentProduct) {
                        if (updateData.quantity) {
                            if (action === 'decrement') {
                                updateData.quantity = currentProduct.quantity - updateData.quantity;
                            } else if (action === 'increment') {
                                updateData.quantity = currentProduct.quantity + updateData.quantity;
                            }

                            updateData.quantity = Math.max(updateData.quantity, 0);
                        }

                        await ProductDocument.findByIdAndUpdate(_id || itemId, updateData, { new: true });
                    }

                    return { success: true, updatedInvoiceItem };
                } catch (error) {
                    console.error('Error updating item with ID:', _id, error);
                    return { success: false, error: `Error updating item with ID: ${_id}` };
                }
            } else {
                return { success: false, error: 'Missing item ID' };
            }
        });

        const results = await Promise.all(updatePromises);
        const failedUpdates = results.filter(result => result.success === false);

        if (failedUpdates.length > 0) {
            return NextResponse.json({ success: false, errors: failedUpdates });
        }

        return NextResponse.json({ success: true, items: results.filter(result => result.success !== false) });
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
        return NextResponse.json({ success: false, error: 'Error deleting product' });
    }
}
