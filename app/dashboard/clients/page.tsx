'use client';
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
import { PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
}

export default function Clients() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<{ key: keyof Customer, order: "asc" | "desc" }>({ key: "fullName", order: "asc" });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const handleAddProduct = () => {
    router.push('/dashboard/clients/addcustomers');
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      if (data) {
        setCustomers(data.customers);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Fetching error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      ?.filter((customer) => {
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
  }, [search, sort, page, pageSize, customers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const handleSort = (key: keyof Customer) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };

  const totalPages = Math?.ceil(customers?.length / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);  // Reset to first page on page size change
  };

  const handleDelete = async (id: string) => {
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
        setCustomers((prevCustomers) => prevCustomers.filter((customer) => customer._id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Delete error: ' + error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/clients/addcustomers/${id}`);
  };

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
                <Select
                  value={String(pageSize)}  // Ensure the value is a string
                  onValueChange={(value) => handlePageSizeChange(Number(value))} // Convert to number here
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
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
                {filteredCustomers?.map((customer) => (
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
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, customers?.length)} of {customers?.length} entries
              </div>
              <div className="flex justify-center">
                <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                <PaginationContent>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={i + 1 === page}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
                <PaginationNext onClick={() => handlePageChange(page + 1)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
