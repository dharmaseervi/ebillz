// models/Company.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gstNumber: { type: String, required: true, unique: true },
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
