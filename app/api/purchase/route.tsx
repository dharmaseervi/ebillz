// pages/api/purchaseOrders.js

import purchase from '@/modules/purchase';
import connectDB from '@/utils/mongodbConnection';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await connectDB();

  try {
    const purchaseOrders = await purchase.find().populate('vendor');
    return NextResponse.json({ success: true, purchaseOrders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(request) {
  await connectDB();

  try {
    const purchaseOrderData = await request.json();
    const newPurchaseOrder = new purchase(purchaseOrderData);
    await newPurchaseOrder.save();
    return NextResponse.json({ success: true, purchaseOrder: newPurchaseOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function PUT(request) {
  await connectDB();

  try {
    const purchaseOrderData = await request.json();
    const updatedPurchaseOrder = await purchase.findByIdAndUpdate(purchaseOrderData._id, purchaseOrderData, { new: true });
    return NextResponse.json({ success: true, purchaseOrder: updatedPurchaseOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function DELETE(request) {
  await connectDB();

  try {
    const { id } = await request.json();
    await purchase.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
