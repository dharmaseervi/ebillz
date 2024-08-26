'use client';

import Layout from "./layout";
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Invoice {
  invoiceDate: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
}

interface Stock {
  name: string;
  quantity: number;
  sellingPrice: number;
}

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState<{ month: string, revenue: number }[]>([]);
  const [expenseData, setExpenseData] = useState<{ month: string, expense: number }[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);
  const [recentBills, setRecentBills] = useState<Invoice[]>([]);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [error, setError] = useState<string>('');
  const [showAllStocks, setShowAllStocks] = useState(false);

  useEffect(() => {
    fetchRevenueData();
    fetchExpenseData();
    fetchInvoiceData();
    fetchStockData();
  }, []);

  const fetchRevenueData = async () => {
    const data = [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
      { month: 'Apr', revenue: 4000 },
      { month: 'May', revenue: 6000 },
      { month: 'Jun', revenue: 7000 },
    ];
    setRevenueData(data);
  };

  const fetchExpenseData = async () => {
    const data = [
      { month: 'Jan', expense: 2000 },
      { month: 'Feb', expense: 1500 },
      { month: 'Mar', expense: 2500 },
      { month: 'Apr', expense: 1800 },
      { month: 'May', expense: 3000 },
      { month: 'Jun', expense: 2800 },
    ];
    setExpenseData(data);
  };



  const fetchInvoiceData = async () => {
    try {
      const res = await fetch(`/api/invoice`);
      const data = await res.json();
      if (data.success) {
        setInvoiceData(data.invoice);
        setRecentBills(data.invoice.slice(-10).reverse()); // Set recent 10 bills
      } else {
        setError('Failed to fetch invoice data');
      }
    } catch (error) {
      setError('Error fetching invoice data');
    }
  };

  const fetchStockData = async () => {
    try {
      const res = await fetch(`/api/items`);
      const data = await res.json();
      if (data) {
        setStockData(data.filterData);
      } else {
        setError('Failed to fetch stock data');
      }
    } catch (error) {
      setError('Error fetching stock data');
    }
  };

  const formatCurrency = (value: number) => {
    return value?.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };


  const totalStockQuantity = stockData?.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalStockAmount = stockData?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.sellingPrice || 0)), 0);

  const displayedStockData = showAllStocks ? stockData : stockData?.slice(-10);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <p>Welcome to your dashboard. Here you can see an overview of your activities.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white p-2">
            <CardContent>
              <h1 className="text-white text-lg">Total Revenue</h1>
              <p className="text-2xl font-bold">
                {formatCurrency(invoiceData?.reduce((sum, data) => sum + (data?.totalAmount || 0), 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-2">
            <CardContent>
              <h1 className="text-white text-lg">Total Orders</h1>
              <p className="text-2xl font-bold">{invoiceData?.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-indigo-400 to-pink-500 text-white p-2">
            <CardContent>
              <h1 className="text-white text-lg">Average Order Value</h1>
              <p className="text-2xl font-bold">
                {invoiceData?.length > 0 ? formatCurrency(invoiceData?.reduce((sum, data) => sum + (data?.totalAmount || 0), 0) / invoiceData?.length) : 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-400 to-orange-500 text-white p-2">
            <CardContent>
              <h1 className="text-white text-lg">Highest Order Value</h1>
              <p className="text-2xl font-bold">
                {invoiceData?.length > 0 ? formatCurrency(Math.max(...invoiceData?.map(data => data?.totalAmount))) : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#4A90E2" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="expense" stroke="#FF6347" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-bold">Total Stock Quantity</h2>
                  <p className="text-2xl font-bold">{totalStockQuantity}</p>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Total Stock Amount</h2>
                  <p className="text-2xl font-bold">{formatCurrency(totalStockAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedStockData?.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {stockData?.length > 10 && !showAllStocks && (
                <button
                  onClick={() => setShowAllStocks(true)}
                  className="mt-2 text-blue-500"
                >
                  Show All
                </button>
              )}
              {showAllStocks && (
                <button
                  onClick={() => setShowAllStocks(false)}
                  className="mt-2 text-blue-500"
                >
                  Show Less
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBills.map((bill, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(bill?.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{bill?.invoiceNumber}</TableCell>
                      <TableCell>{bill?.customerName}</TableCell>
                      <TableCell>{formatCurrency(bill?.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
