
import connectDB from '@/utils/mongodbConnection';
import ProductDocument from '@/modules/items'
import { NextResponse } from 'next/server';
import InvoiceItem from '@/modules/InvoiceItem';

export async function POST(request: Request) {
    await connectDB();

    try {

        const { name, unit, hsnCode, sellingPrice, quantity, description } = await request.json();
        const item = new ProductDocument({
            name,
            unit,
            hsnCode,
            sellingPrice,
            quantity,
            description,
        });
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
        const id = searchParams.get('id')
        const data = await ProductDocument.find();

        let filterData;
        if (search) {
            filterData = data.filter((item) => {
                const productName = item.name ? item.name.toLowerCase() : '';
                const symbol = item.symbol ? item.symbol.toLowerCase() : '';
                return productName.includes(search.toLowerCase()) || symbol.includes(search.toLowerCase());
            });
        } else if (id) {
            filterData = await ProductDocument.findById(id);
        }
        else {
            filterData = await ProductDocument.find();
        }

        return NextResponse.json({ filterData });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Error fetching customers' });
    }
}

export async function PUT(request: Request) {
    await connectDB();

    try {
        const { formData, updates } = await request.json();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        console.log(id, 'form ids to upodatew');

        if (id) {
            // Update a single item by ID
            try {
                const updatedItem = await ProductDocument.findByIdAndUpdate(id, formData, { new: true });
                if (!updatedItem) {
                    return NextResponse.json({ success: false, error: 'Item not found' });
                }
                console.log(updatedItem, 'updated ?');

                return NextResponse.json({ success: true, item: updatedItem });
            } catch (error) {
                console.error('Error updating item:', error);
                return NextResponse.json({ success: false, error: 'Error updating item' });
            }
        }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ success: false, error: 'Invalid input format. Expected an array of updates.' });
        }

        // Batch update
        const updatePromises = updates.map(async (update) => {
            const { _id, ...updateData } = update;

            if (_id) {
                try {
                    const updatedItem = await InvoiceItem.findByIdAndUpdate(_id, updateData, { new: true });
                    if (!updatedItem) {
                        return { success: false, error: `Item with ID: ${_id} not found` };
                    }
                    return updatedItem;
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