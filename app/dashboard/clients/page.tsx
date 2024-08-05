'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

export default function Clients() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAddProduct = () => {
    router.push('/dashboard/clients/addcustomers');
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      console.log(data, 'customers fetched');

      if (data) {
        setCustomer(data.customers);
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
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customer
      .filter((customer) => {
        const searchValue = search.toLowerCase();
        return (
          customer?.fullName?.toLowerCase().includes(searchValue) ||
          customer?.email?.toLowerCase().includes(searchValue) ||
          customer?.phone?.includes(searchValue) ||
          customer?.city?.toLowerCase().includes(searchValue)
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
  }, [search, sort, page, pageSize, customer]);

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/customers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete customer');
      const data = await res.json();

      if (data.success) {
        setCustomer((prevCustomers) => prevCustomers.filter((customer) => customer._id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Delete error: ' + error.message);
    }
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/clients/addcustomers/${id}`);
  };


  console.log(customer);

  return (
    <div className='p-4'>
      <div>
        <Button onClick={handleAddProduct} className='bg-black-100 rounded px-4 py-2 text-white'>Add customers</Button>
      </div>
      <div className='mt-5'>
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Input placeholder="Search customers..." value={search} onChange={handleSearch} className="max-w-xs" />
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
                  <TableHead className="cursor-pointer" onClick={() => handleSort("fullName")}>
                    Customer Name
                    {sort.key === "fullName" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                    Email
                    {sort.key === "email" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("phone")}>
                    Phone Number
                    {sort.key === "phone" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("city")}>
                    City
                    {sort.key === "city" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button onClick={() => handleEdit(customer._id)} className="bg-green-700">Edit</Button>
                      <Button onClick={() => handleDelete(customer._id)} className="bg-red-600">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, customer.length)} of {customer.length} entries
              </div>
              <Pagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={customer.length}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
