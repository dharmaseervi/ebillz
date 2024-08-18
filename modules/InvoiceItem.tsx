import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IInvoiceItem extends Document {
    itemDetails: string;
    hsn: string;
    quantity: number;
    rate: number;
    discount?: number;
    tax: number;
    amount: number;
    desc?: string;
    unit: string;
    userId:Types.ObjectId;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
    itemDetails: { type: String, required: true },
    hsn: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, required: false },
    tax: { type: Number, required: true },
    amount: { type: Number, required: true },
    desc: { type: String, required: false },
    unit: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.models?.InvoiceItem || mongoose.model<IInvoiceItem>('InvoiceItem', invoiceItemSchema);
