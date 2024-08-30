import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseInvoice extends Document {
    invoiceNumber: Number;
    purchaseOrderNumber: Number;
    supplierName: string;
    supplierId: Types.ObjectId;
    purchaseDate: Date;
    dueDate: Date;
    items: Types.ObjectId[];
    invoiceStatus: string;
    totalAmount: Number;
    userId:string;
}

const purchaseInvoiceSchema = new Schema<IPurchaseInvoice>({
    invoiceNumber: { type: Number, required: true },
    purchaseOrderNumber: { type: Number, required: true },
    supplierName: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    purchaseDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'InvoiceItem' }],
    invoiceStatus: { type: String, enum: ['paid', 'not paid', 'pending'], default: 'not paid' },
    totalAmount: { type: Number, required: true },
    userId: { type:String,  required: true },
});

export default mongoose.models?.PurchaseInvoice || mongoose.model<IPurchaseInvoice>('PurchaseInvoice', purchaseInvoiceSchema);
