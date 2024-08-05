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

export default function Additems() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAddProduct = () => {
    router.push('/dashboard/items/addproduct');
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (data) {
        setProducts(data.filterData);
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
    fetchProducts();
  }, []);
  console.log(products);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchValue = search.toLowerCase();
        return (
          product?.name?.toLowerCase().includes(searchValue) ||
          product?.hsnCode?.includes(searchValue) ||
          product?.description?.toLowerCase().includes(searchValue)
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
  }, [search, sort, page, pageSize, products]);

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
      const res = await fetch(`/api/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete product');
      const data = await res.json();

      if (data.success) {
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Delete error: ' + error);
    }
  };

  const handleEdit = (id) => {
    router.push(`/dashboard/items/addproduct/${id}`);
  };

  return (
    <div className='p-4'>
      <div>
        <Button onClick={handleAddProduct} className='bg-black-100 rounded px-4 py-2 text-white'>Add Product</Button>
      </div>
      <div className='mt-5'>
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Input placeholder="Search products..." value={search} onChange={handleSearch} className="max-w-xs" />
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
                  <TableHead className="cursor-pointer" onClick={() => handleSort("itemDetails")}>
                    Item Details
                    {sort.key === "itemDetails" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("hsn")}>
                    HSN
                    {sort.key === "hsn" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                    Quantity
                    {sort.key === "quantity" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("rate")}>
                    Rate
                    {sort.key === "rate" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("unit")}>
                    Unit
                    {sort.key === "unit" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.hsnCode}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.sellingPrice}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button onClick={() => handleEdit(product._id)} className="bg-green-700">Edit</Button>
                      <Button onClick={() => handleDelete(product._id)} className="bg-red-600">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, products.length)} of {products.length} entries
              </div>
              <Pagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={products.length}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
