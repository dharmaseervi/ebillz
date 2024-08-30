import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: true
  },

});

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export default Expense;
