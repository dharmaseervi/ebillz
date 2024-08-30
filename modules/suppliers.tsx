import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: { type: String, required: true },


});
// Create compound unique indexes on email and gstNumber with userId
SupplierSchema.index({ email: 1, userId: 1 }, { unique: true });
SupplierSchema.index({ gstNumber: 1, userId: 1 }, { unique: true });
export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
