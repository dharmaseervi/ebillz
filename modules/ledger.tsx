import mongoose, { Schema, Document, Types } from 'mongoose';

interface ILedger extends Document {
    date: Date;
    particulars: string;
    vchType: string;
    vchNo: string;
    debit: number;
    credit: number;
    balance: number;
    supplierId: mongoose.Types.ObjectId;
    userId: string;
}

const LedgerSchema: Schema = new Schema({
    date: { type: Date, required: true },
    particulars: { type: String, required: true },
    vchType: { type: String, required: true },
    vchNo: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    userId: { type: String, required: true },
});

export default mongoose.models.Ledger || mongoose.model<ILedger>('Ledger', LedgerSchema);
