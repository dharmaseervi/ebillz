'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface LedgerEntry {
    _id: string;
    date: string;
    particulars: string;
    vchType: string;
    vchNo: string;
    debit: number;
    credit: number;
    balance: number;
    supplierId?: {
        _id: string;
        name: string;
    };
}

interface Supplier {
    _id: string;
    name: string;
}


const LedgerForm = () => {
    const [formData, setFormData] = useState({
        date: '',
        particulars: '',
        vchType: '',
        vchNo: '',
        debit: 0,
        credit: 0,
        supplierId: '',
    });

    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editEntryId, setEditEntryId] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            const data = await res.json();
            setSuppliers(data.supplier);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const fetchEntries = async () => {
        const supplierId = formData.supplierId;
        if (supplierId) {
            setLoadingEntries(true);
            try {
                const res = await fetch(`/api/ledger?supplierId=${supplierId}`);
                const data = await res.json();
                if (data.success) {
                    setEntries(data.entries);
                }
            } catch (error) {
                console.error("Error fetching ledger entries:", error);
            } finally {
                setLoadingEntries(false);
            }
        }
    };
console.log(entries);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (formData.supplierId) {
            fetchEntries();
        }
    }, [formData.supplierId]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode ? `/api/ledger` : '/api/ledger';
    
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, _id: editEntryId }), // Include _id for edit
        });
    
        if (res.ok) {
            fetchEntries();
            setFormData({
                date: '',
                particulars: '',
                vchType: '',
                vchNo: '',
                debit: 0,
                credit: 0,
                supplierId: '',
            });
            setEditMode(false);
            setEditEntryId(null);
        }
    };
    
    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/ledger`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), // Send id in DELETE request
        });
    
        if (res.ok) {
            fetchEntries();
        }
    };
    

    const handleEdit = (entry: LedgerEntry) => {
    
        setFormData({
            date: entry?.date ? entry.date.split('T')[0] : '',  
            particulars: entry.particulars || '',
            vchType: entry.vchType || '',
            vchNo: entry.vchNo || '',
            debit: entry.debit || 0,
            credit: entry.credit || 0,
            supplierId: entry.supplierId?._id || '',
        });
    
        setEditMode(true);
        setEditEntryId(entry._id);
    };
    

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Ledger Management</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{editMode ? 'Edit Ledger Entry' : 'Create Ledger Entry'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            placeholder="Date"
                            required
                            className="w-full"
                        />
                        <Input
                            type="text"
                            name="particulars"
                            placeholder="Particulars"
                            value={formData.particulars}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                        <Input
                            type="text"
                            name="vchType"
                            placeholder="Voucher Type"
                            value={formData.vchType}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                        <Input
                            type="text"
                            name="vchNo"
                            placeholder="Voucher No"
                            value={formData.vchNo}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                name="debit"
                                placeholder="Debit"
                                value={formData.debit === 0 ? '' : formData.debit}
                                onChange={handleChange}
                                className="w-full"
                            />
                            <Input
                                type="number"
                                name="credit"
                                placeholder="Credit"
                                value={formData.credit === 0 ? '' : formData.credit}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                            value={formData.supplierId}
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers?.map((supplier) => (
                                    <SelectItem key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" className="w-full">
                            {editMode ? 'Update Entry' : 'Add Entry'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Ledger Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingEntries ? (
                        <p>Loading entries...</p>
                    ) : entries.length > 0 ? (
                        <Table className="min-w-full bg-white mt-4">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Particulars</TableHead>
                                    <TableHead>Voucher Type</TableHead>
                                    <TableHead>Voucher No</TableHead>
                                    <TableHead>Debit</TableHead>
                                    <TableHead>Credit</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries?.map((entry) => (
                                    <TableRow key={entry._id}>
                                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.particulars}</TableCell>
                                        <TableCell>{entry.vchType}</TableCell>
                                        <TableCell>{entry.vchNo}</TableCell>
                                        <TableCell>{entry.debit === 0 ? '₹ 0' : `₹ ${entry?.debit?.toLocaleString('en-IN')}`}</TableCell>
                                        <TableCell>{entry.credit === 0 ? '₹ 0' : `₹ ${entry?.credit?.toLocaleString('en-IN')}`}</TableCell>
                                        <TableCell>{`₹ ${entry?.balance?.toLocaleString('en-IN')}`}</TableCell>
                                        <TableCell className='flex gap-2'>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(entry._id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No entries found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LedgerForm;
