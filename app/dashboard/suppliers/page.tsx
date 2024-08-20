'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SupplierForm from '@/components/suppliers/forms';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface Supplier {
    _id: string;
    name: string;
    contactNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    gstNumber: string;
}


const SupplierList: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Type definition for suppliers array
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState('');
    const router = useRouter();
    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            const data = await res.json();

            if (data.success) {
                setSuppliers(data.supplier);
            } else {
                console.error('Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleEdit = (supplier: React.SetStateAction<Supplier | null>) => {
        setEditingSupplier(supplier);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/suppliers`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                fetchSuppliers();
            } else {
                console.error('Failed to delete supplier');
            }
        } catch (error) {
            console.error('Failed to delete supplier:', error);
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingSupplier(null);
        fetchSuppliers();
    };
    const goToLedger = (id: string) => {
        if (suppliers) {
            router.push(`/dashboard/ledger/${id}`);
        }
    };
    console.log(suppliers);


    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Supplier Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setShowForm(true)} className="mb-4">
                        Add New Supplier
                    </Button>

                    {showForm && (
                        <Dialog open={showForm} onOpenChange={setShowForm}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                                </DialogHeader>
                                <SupplierForm
                                    onSuccess={handleSuccess}
                                    cancel={() => setShowForm(false)}
                                    supplier={editingSupplier}
                                />
                            </DialogContent>
                        </Dialog>
                    )}

                    <Table className="min-w-full bg-white rounded-lg shadow">
                        <TableHeader>
                            <TableRow className="bg-gray-100 text-gray-700">
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Zip</TableHead>
                                <TableHead>GST</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers?.map((supplier) => (
                                <TableRow key={supplier._id} className="hover:bg-gray-50">
                                    <TableCell className="py-2 px-4">{supplier.name}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.contactNumber}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.email}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.address}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.city}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.state}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.zip}</TableCell>
                                    <TableCell className="py-2 px-4">{supplier.gstNumber}</TableCell>
                                    <TableCell className="py-2 px-4 flex gap-2">
                                        <Button onClick={() => handleEdit(supplier)} variant="secondary" size="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </Button>
                                        <Button onClick={() => handleDelete(supplier._id)} variant="destructive" size="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </Button>
                                        {suppliers && (
                                            <Button type="button" onClick={() => goToLedger(supplier._id)} className="bg-gray-500">
                                                View Ledger
                                            </Button>
                                        )}
                                        
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="text-gray-500 text-sm">
                    Total Suppliers: {suppliers.length}
                </CardFooter>
            </Card>
        </div>
    );
};

export default SupplierList;
