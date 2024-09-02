'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Expense {
  _id?: string;
  amount: number;
  date: string;
  category: string;
  vendor: string;
  notes: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formData, setFormData] = useState<Expense>({
    amount: 0,
    date: '',
    category: '',
    vendor: '',
    notes: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: string } | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) {
      await updateExpense(currentId);
    } else {
      await addExpense();
    }
    setFormData({ amount: 0, date: '', category: '', vendor: '', notes: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const addExpense = async () => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to add expense');
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (id: string | null) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update expense');
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData(expense);
    setIsEditing(true);
    setCurrentId(expense._id || null);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = React.useMemo(() => {
    let sortableExpenses = [...expenses];
    if (sortConfig !== null) {
      sortableExpenses.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Expense] || ''; // fallback if undefined
        const bValue = b[sortConfig.key as keyof Expense] || '';
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableExpenses;
  }, [expenses, sortConfig]);
  

  const filteredExpenses = sortedExpenses.filter(expense =>
    expense.vendor.toLowerCase().includes(search.toLowerCase()) ||
    expense.category.toLowerCase().includes(search.toLowerCase()) ||
    expense.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Expenses</h1>
      <p className="text-lg text-gray-600 mb-4">Manage your expenses here.</p>

      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-700">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                required
              >
                <option value="">Select category</option>
                <option value="office">Office Supplies</option>
                <option value="travel">Travel</option>
                <option value="utilities">Utilities</option>
                {/* Add more categories as needed */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Vendor</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Enter vendor"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Enter notes"
              rows={3}
            ></textarea>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Update Expense' : 'Add Expense'}
            </button>
            <button
              type="button"
              className="border-indigo-600 border bg-white text-indigo-600 py-2 px-4 rounded-md shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setIsEditing(false);
                setFormData({ amount: 0, date: '', category: '', vendor: '', notes: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Expense List</h2>
          <input
            type="text"
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
            placeholder="Search expenses"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className='overflow-x-auto'>

    
        <table className="w-full mt-2 border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="border p-3 cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date
                {sortConfig?.key === 'date' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </th>
              <th
                className="border p-3 cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortConfig?.key === 'amount' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </th>
              <th
                className="border p-3 cursor-pointer"
                onClick={() => handleSort('category')}
              >
                Category
                {sortConfig?.key === 'category' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </th>
              <th
                className="border p-3 cursor-pointer"
                onClick={() => handleSort('vendor')}
              >
                Vendor
                {sortConfig?.key === 'vendor' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </th>
              <th className="border p-3">Notes</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense._id} className="hover:bg-gray-100">
                <td className="border p-3">{expense.date}</td>
                <td className="border p-3">{expense.amount}</td>
                <td className="border p-3">{expense.category}</td>
                <td className="border p-3">{expense.vendor}</td>
                <td className="border p-3">{expense.notes}</td>
                <td className="border p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExpense(expense._id!)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
