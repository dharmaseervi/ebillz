'use client'
import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const Reports = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const expenseData = {
    labels: ['Office Supplies', 'Travel', 'Utilities', 'Others'],
    datasets: [
      {
        label: 'Expenses',
        data: [300, 500, 200, 400],
        backgroundColor: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B'],
      },
    ],
  };

  const monthlyData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [500, 400, 450, 600, 700, 650],
        backgroundColor: '#4A90E2',
      },
    ],
  };

  return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Reports</h1>
        <p>Generate and view financial reports.</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Select Date Range</h2>
          <div className="mt-2 flex space-x-4">
            <div>
              <label className="block text-gray-700">Start Date</label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">End Date</label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Expense Summary</h2>
          <Bar data={expenseData} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Monthly Trends</h2>
          <Line data={monthlyData} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Income vs. Expenses</h2>
          {/* Similar chart component can be used here */}
        </div>

        <div className="mt-8">
          <button className="px-4 py-2 bg-green-500 text-white rounded">Export Report</button>
        </div>
      </div>
  );
};

export default Reports;
