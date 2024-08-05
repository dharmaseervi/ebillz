'use client';
import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export default function InvoiceTable() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoice');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      console.log(data, 'invoice fetched');

      if (data.success) {
        setInvoices(data.invoice);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Fetching error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const searchValue = search.toLowerCase();
        return (
          invoice?.customerName?.toLowerCase().includes(searchValue) ||
          String(invoice?.invoiceNumber)?.includes(searchValue) ||
          invoice?.invoiceDate?.includes(searchValue) ||
          invoice?.dueDate?.includes(searchValue)
        );
      })
      .sort((a, b) => {
        if (sort.order === "asc") {
          return a[sort.key] > b[sort.key] ? 1 : -1;
        } else {
          return a[sort.key] < b[sort.key] ? 1 : -1;
        }
      })
      .slice((page - 1) * pageSize, page * pageSize);
  }, [search, sort, page, pageSize, invoices]);

  const handleSearch = (e) => setSearch(e.target.value);
  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };
  const handlePageChange = (page) => setPage(page);
  const handlePageSizeChange = (size) => setPageSize(size);

  const handleEdit = (id) => {
    router.push(`/dashboard/invoices/createinvoice/${id}`);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        const res = await fetch(`/api/invoice?id=${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
          setInvoices(invoices.filter((invoice) => invoice.id !== id));
          alert('Invoice deleted successfully');
          fetchInvoices();
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handlePrint = (id) => {
    router.push(`/dashboard/invoices/${id}`);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    console.log(id, newStatus, "kk");

    try {
      const res = await fetch(`/api/invoice?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceStatus: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      const data = await res.json();

      if (data.success) {
        fetchInvoices();
      } else {

      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Manage your invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input placeholder="Search invoices..." value={search} onChange={handleSearch} className="max-w-xs" />
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size">Show</Label>
            <Select id="page-size" value={pageSize} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={10}>10</SelectItem>
                <SelectItem value={20}>20</SelectItem>
                <SelectItem value={50}>50</SelectItem>
                <SelectItem value={100}>100</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="page-size">entries</Label>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("invoiceNumber")}>
                Invoice
                {sort.key === "invoiceNumber" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("customerName")}>
                Customer
                {sort.key === "customerName" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("invoiceDate")}>
                Date
                {sort.key === "invoiceDate" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("dueDate")}>
                Due Date
                {sort.key === "dueDate" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("amount")}>
                Amount
                {sort.key === "amount" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("invoiceStatus")}>
                Status
                {sort.key === "invoiceStatus" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</TableCell>
                <TableCell className="text-right">
                  {invoice?.totalAmount?.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      invoice.invoiceStatus === "Paid" ? "secondary" : invoice.invoiceStatus === "not paid" ? "destructive" : "outline"
                    }
                  >
                    {invoice.invoiceStatus}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button onClick={() => handleEdit(invoice._id)} className="bg-green-700">Edit</Button>
                  <Button onClick={() => handleDelete(invoice._id)} className="bg-red-600">Delete</Button>
                  <Button onClick={() => handlePrint(invoice._id)} className="bg-gray-800">Print</Button>
                  <Button onClick={() => handleStatusUpdate(invoice._id, 'Paid')} className="bg-indigo-600">Mark as Paid</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, invoices.length)} of {invoices.length} entries
          </div>
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={invoices.length}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
