'use client'
import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface Expense {
  amount: number;
  date: string;
  category: string;
  vendor: string;
  notes: string;
}

const Reports = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    return (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
  });

  const expenseCategories = [...new Set(filteredExpenses.map(expense => expense.category))];
  const expenseData = {
    labels: expenseCategories,
    datasets: [
      {
        label: 'Expenses',
        data: expenseCategories.map(category => filteredExpenses.filter(expense => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)),
        backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#BD10E0', '#B8E986'],
      },
    ],
  };

  const monthlyData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Array.from({ length: 12 }, (_, i) => filteredExpenses.filter(expense => new Date(expense.date).getMonth() === i).reduce((sum, expense) => sum + expense.amount, 0)),
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Reports</h1>
      <p className="text-lg text-gray-600 mb-4">Generate and view financial reports.</p>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Select Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Start Date</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="block text-gray-700">End Date</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Expense Summary</h2>
          <Bar data={expenseData} />
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Monthly Trends</h2>
          <Line data={monthlyData} />
        </div>
      </div>

    </div>
  );
};

export default Reports;
