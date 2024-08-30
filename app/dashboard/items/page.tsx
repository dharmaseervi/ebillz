'use client'
import React, { useEffect, useMemo, useState, ChangeEvent, MouseEvent } from 'react';
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

// Define types for the product data
interface Product {
  _id: string;
  name: string;
  hsnCode: string;
  quantity: number;
  sellingPrice: number;
  description: string;
  unit: string;
}

export default function AddItems() {
  const router = useRouter();

  // Define state with proper typing
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<{ key: keyof Product, order: "asc" | "desc" }>({ key: "name", order: "asc" });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const handleAddProduct = () => {
    router.push('/dashboard/items/addproduct');
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (data) {
        setProducts(data.filterData as Product[]); // Ensure data is typed correctly
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

  const filteredProducts = useMemo(() => {
    return products
      ?.filter((product) => {
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

  // Add typing to event handlers
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSort = (key: keyof Product) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ key, order: "asc" });
    }
  };
  const handlePageChange = (page: number) => setPage(page);
  const handlePageSizeChange = (size: number) => setPageSize(size);

  const handleDelete = async (id: string) => {
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

  const handleEdit = (id: string) => {
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
                <Select value={String(pageSize)} onValueChange={(value) => handlePageSizeChange(Number(value))}>
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
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    Item Details
                    {sort.key === "name" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("hsnCode")}>
                    HSN
                    {sort.key === "hsnCode" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                    Quantity
                    {sort.key === "quantity" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("sellingPrice")}>
                    Rate
                    {sort.key === "sellingPrice" && <span className="ml-1">{sort.order === "asc" ? "\u2191" : "\u2193"}</span>}
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
                {filteredProducts?.map((product) => (
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
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, products?.length)} of {products?.length} entries
              </div>
              <Pagination
               

              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
