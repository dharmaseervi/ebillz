import mongoose, { Schema, Document, Types } from 'mongoose';
import customers from './customers';

export interface IInvoice extends Document {
    invoiceNumber: Number;
    customerName: string;
    customerId: Types.ObjectId;
    invoiceDate: Date;
    dueDate: Date;
    items: Types.ObjectId[];
    invoiceStatus: string;
    totalAmount: Number;
    userId:string;
}

const invoiceSchema = new Schema<IInvoice>({
    invoiceNumber: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'customer', required: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'InvoiceItem' }],
    invoiceStatus: { type: String, enum: ['paid', 'not paid', 'pending'], default: 'not paid' },
    totalAmount: { type: Number, required: true },
    userId: { type: String, required: true },
});

export default mongoose.models?.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
 