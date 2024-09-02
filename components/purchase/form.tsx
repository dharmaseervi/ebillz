'use client';
import React, { useState, ChangeEvent, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import SupplierForm from '../suppliers/forms';

interface Supplier {
    name: string;
    _id: string;
    supplierName: string;
    address: string;
    city: string;
    state: string;
    email: string;
    phone: string;
    zip: string;
}

interface Item {
    sellingPrice: number;
    _id: string | undefined;
    name: string;
    hsnCode: number;
    purchasePrice: number;
    description: string;
    unit: string;
}

interface Row {
    _id?: string; // Optional _id field for items that are fetched from the database
    itemDetails: string;
    hsn: number;
    quantity: number;
    rate: number;
    discount: number;
    tax: number;
    amount: number;
    desc: string;
    unit: string;
}

interface FormData {
    purchaseOrderNumber: number;
    purchaseInvoiceNumber: string;
    supplierName: string;
    supplierId?: string;
    purchaseDate: string;
    dueDate: string;
    items: Row[];
    totalAmount: number;
}

function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const currentDate = new Date();
const formattedDate = formatDate(currentDate);

export default function PurchaseForm() {
    const [formData, setFormData] = useState<FormData>({
        purchaseOrderNumber: 0,
        purchaseInvoiceNumber: '',
        supplierName: '',
        purchaseDate: formattedDate,
        dueDate: '',
        items: [],
        totalAmount: 0,
    });
    const [isFocused, setIsFocused] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Supplier[]>([]);
    const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
    const [rows, setRows] = useState<Row[]>([
        { itemDetails: '', hsn: 0, quantity: 1, rate: 0, discount: 0, tax: 18, amount: 0, desc: '', unit: '' },
    ]);
    const [itemSearchResults, setItemSearchResults] = useState<Item[]>([]);
    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
    const [supplierAddress, setSupplierAddress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [purchaseData, setPurchaseData] = useState({
        totalAmount: 0,
        cgst: 0,
        sgst: 0,
    });
    const [supplierDetails, setSupplierDetails] = useState<Supplier | null>(null);
    const router = useRouter();

    useEffect(() => {
        setFormData({ ...formData, items: rows, totalAmount: purchaseData.totalAmount });
    }, [rows, purchaseData.totalAmount]);

    useEffect(() => {
        fetchLastPurchaseOrderNumber();
    }, []);

    const fetchLastPurchaseOrderNumber = async () => {
        try {
            const res = await fetch('/api/lastpurchaseinvoice');
            const data = await res.json();
            console.log(data);
            if (data.success) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    purchaseOrderNumber: data.latestPurchaseInvoiceNumber != null ? data.latestPurchaseInvoiceNumber + 1 : 1,
                }))
            } else {
                setError('Failed to fetch the latest purchase order number');
            }
        } catch (error) {
            setError('Error fetching the latest purchase order number');
        }
    };

    const handleAddRow = () => {
        setRows([
            ...rows,
            { itemDetails: '', hsn: 0, quantity: 1, rate: 0, discount: 0, tax: 18, amount: 0, desc: '', unit: '' },
        ]);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const calculateAmount = (row: Row) => {
        const discountAmount = row.rate * (row.discount / 100);
        const totalBeforeTax = row.quantity * (row.rate - discountAmount);
        const taxAmount = totalBeforeTax * (row.tax / 100);
        return totalBeforeTax + taxAmount;
    };


    const calculateTotalAmount = () => {
        let total = 0;
        let totalTax = 0;
        rows.forEach((row) => {
            const amount = calculateAmount(row);
            total += amount;

            if (row.tax === 18) {
                totalTax += amount - (amount / 1.18);
            } else {
                totalTax += amount / 1.28;
            }
        });

        const cgst = totalTax / 2;
        const sgst = totalTax / 2;

        setPurchaseData({
            totalAmount: total,
            cgst,
            sgst,
        });
    };

    useEffect(() => {
        calculateTotalAmount(); // Call calculateTotalAmount when rows change
    }, [rows]);

    const handleChangeRow = (index: number, e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newRows = [...rows];
        newRows[index] = {
            ...newRows[index],
            [name]: name === 'quantity' || name === 'rate' || name === 'discount' || name === 'tax' ? parseFloat(value) : value,
        };
        newRows[index].amount = calculateAmount(newRows[index]);
        setRows(newRows);
        calculateTotalAmount();
    };

    const handleFocus = (index: number) => {
        setIsFocused(true);
        setActiveRowIndex(index);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const fetchSupplier = useCallback(
        debounce(async (value: string) => {
            try {
                const res = await fetch(`/api/suppliers?search=${value}`);
                const data = await res.json();

                if (res.ok) {
                    setSearchResults(data.supplier);
                } else {
                    console.error('Failed to fetch suppliers:', data.message || 'Unknown error');
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
                setSearchResults([]);
            }
        }, 300),
        []
    );

    const handleSupplierSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSupplierSearch(value);
        fetchSupplier(value);
    };

    const handleSelectSupplier = (supplier: Supplier) => {
        setFormData({
            ...formData,
            supplierName: supplier.name,
            supplierId: supplier._id,
        });
        setSupplierAddress(`${supplier.address}, ${supplier.city}, ${supplier.state}, ${supplier.zip}`);
        setSupplierDetails(supplier);
        setSearchResults([]);
    };

    const handleAddNewSupplier = () => {
        setShowAddSupplierForm(true);
        setSupplierSearch('');
        setSearchResults([]);
    };

    const handleCancelAddSupplier = () => {
        setShowAddSupplierForm(false);
        setFormData({ ...formData, supplierName: '' });
    };

    const handleSuccess = () => {
        setShowAddSupplierForm(false)
    };


    const convertToDate = (dateString: string) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);


        // Convert purchase date if in DD/MM/YYYY format
        const purchaseDateFormatted = formData.purchaseDate.includes('/')
            ? convertToDate(formData.purchaseDate)
            : formData.purchaseDate;

        const purchaseDate = new Date(purchaseDateFormatted);
        const dueDate = new Date(formData.dueDate);

        // Check if the dates are valid
        if (isNaN(purchaseDate.getTime())) {
            setError('Invalid purchase date');
            setLoading(false);
            return;
        }

        if (isNaN(dueDate.getTime())) {
            setError('Invalid due date');
            setLoading(false);
            return;
        }

        const updatedFormData = {
            ...formData,
            purchaseDate: purchaseDate.toISOString(),
            dueDate: dueDate.toISOString(),
            items: rows,
            totalAmount: purchaseData.totalAmount,
        };


        try {
            const res = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFormData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const data = await res.json();


            // Update inventory with purchased items
            const updatedItems = updatedFormData.items.map(item => ({
                ...item,
                action: 'increment', // Add action as part of each item object
            }));

            const itemsRes = await fetch(`/api/items`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ updates: updatedItems }), // Wrap the array in an "updates" key
            });


            if (!itemsRes.ok) {
                const errorData = await itemsRes.json();
                throw new Error(errorData.error || 'Failed to update inventory');
            }


            // Get the new purchase order ID from the response
            const newPurchaseOrderId = data.purchaseOrderId;
            // router.push(`/dashboard/purchaseorders/${newPurchaseOrderId}`);

            setFormData({
                purchaseOrderNumber: 0,
                purchaseInvoiceNumber: '',
                supplierName: '',
                purchaseDate: formatDate(new Date()),
                dueDate: '',
                items: [],
                totalAmount: 0,
            });

            setSupplierAddress('');
            setRows([
                { itemDetails: '', hsn: 0, quantity: 1, rate: 0, discount: 0, tax: 18, amount: 0, desc: '', unit: '' },
            ]);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            purchaseOrderNumber: 0,
            purchaseInvoiceNumber: '',
            supplierName: '',
            purchaseDate: formatDate(new Date()),
            dueDate: '',
            items: [],
            totalAmount: 0,
        });

        setSupplierAddress('');
        setRows([
            { itemDetails: '', hsn: 0, quantity: 1, rate: 0, discount: 0, tax: 18, amount: 0, desc: '', unit: '' },
        ]);
    };

    const fetchItemSearchResults = useCallback(
        debounce(async (value: string) => {
            try {
                const res = await fetch(`/api/items?search=${value}`);
                const data = await res.json();

                if (res.ok) {
                    setItemSearchResults(data.filterData);
                    setIsFocused(true);
                } else {
                    console.error('Failed to fetch items:', data.message || 'Unknown error');
                    setItemSearchResults([]);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                setItemSearchResults([]);
            }
        }, 300),
        []
    );

    const handleChangeRowItemDetails = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newRows = [...rows];
        newRows[index] = {
            ...newRows[index],
            [name]: value,
        };
        setRows(newRows);
        if (name === 'itemDetails' && value) {
            fetchItemSearchResults(value);
        }
    };


    const handleSelectItem = (index: number, item: Item) => {
        const newRows = [...rows];
        newRows[index] = {
            ...newRows[index],
            _id: item._id, // Include the _id from the itemSearchResults
            itemDetails: item.name,
            hsn: item.hsnCode,
            quantity: 1,
            rate: item.sellingPrice,
            amount: calculateAmount({
                ...newRows[index],
                quantity: 1,
                rate: item.sellingPrice,
                discount: newRows[index].discount,
                tax: newRows[index].tax,
            }),
            desc: item.description,
            unit: item.unit,
        };

        setRows(newRows);
        setIsFocused(false);
    };

    const handlePrint = () => {
        router.push('/dashboard/purchaseorders/previewandprint');
    };

    return (
        <div className="max-w-full mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Purchase Order</h2>
            <div className="space-y-2">
                <div className="grid gap-6 max-w-sm">
                    <div className="">
                        <div className="relative">
                            <label htmlFor="supplierName" className="block font-medium">Supplier Name</label>
                            <Input
                                type="text"
                                name="supplierName"
                                value={supplierSearch}
                                onChange={handleSupplierSearch}
                                className="w-full border border-gray-300 p-2 rounded"
                                onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                                autoComplete="off"
                            />
                            {searchResults?.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-2 rounded shadow-lg">
                                    {searchResults.map((supplier) => (
                                        <li
                                            key={supplier._id}
                                            onClick={() => handleSelectSupplier(supplier)}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            {supplier.name}
                                        </li>
                                    ))}
                                    <li
                                        onClick={handleAddNewSupplier}
                                        className="p-2 cursor-pointer hover:bg-gray-100 text-blue-500"
                                    >
                                        + Add new supplier
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className={`bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 z-40 ${showAddSupplierForm ? 'flex' : 'hidden'} items-center justify-center`}>
                            <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-lg z-50">
                                <h3 className="font-medium mb-2">Add New Supplier</h3>
                                <SupplierForm cancel={handleCancelAddSupplier} onSuccess={handleSuccess} />
                            </div>
                        </div>

                        {supplierAddress && (
                            <div className="border mt-2 rounded bg-gray-100 p-2">
                                <p className='text-md text-black uppercase font-medium'>{supplierDetails?.supplierName}</p>
                                <p className='text-sm text-black capitalize'>{supplierAddress}</p>
                                <p className='text-sm text-black capitalize'>GST No: URP</p>
                                <p className='text-sm text-black capitalize'>State Name: {supplierDetails?.state}</p>
                                <p className='text-sm text-black capitalize'>Email: {supplierDetails?.email}</p>
                                <p className='text-sm text-black capitalize'>Mobile: {supplierDetails?.phone}</p>
                            </div>
                        )}
                    </div>
                    <div className="">
                        <label htmlFor="purchaseOrderNumber" className="block font-medium">Purchase Order Number</label>
                        <Input
                            type="text"
                            name="purchaseOrderNumber"
                            value={formData.purchaseOrderNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                            readOnly
                        />
                    </div>
                    <div className="">
                        <label htmlFor="purchaseInvoiceNumber" className="block font-medium">Purchase Invoice Number</label>
                        <Input
                            type="text"
                            name="purchaseInvoiceNumber"
                            value={formData.purchaseInvoiceNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div className="grid gap-6 grid-cols-2">
                        <div>
                            <label htmlFor="purchaseDate" className="block font-medium">Purchase Date</label>
                            <Input
                                type="text"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block font-medium">Due Date</label>
                            <Input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <Table className="mt-8 ">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[10px]">No</TableHead>
                            <TableHead>Item Details</TableHead>
                            <TableHead>HSN/SAC</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Discount %</TableHead>
                            <TableHead>Tax %</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="w-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="relative w-[200px]">
                                    <Input
                                        type="text"
                                        name="itemDetails"
                                        value={row.itemDetails}
                                        onChange={(e) => handleChangeRowItemDetails(index, e)}
                                        onFocus={() => handleFocus(index)}
                                        autoComplete="off"
                                        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                                                  className='lg:w-full w-44'
                                    />
                                    {index === activeRowIndex && isFocused && itemSearchResults.length > 0 && (
                                        <ul className="absolute z-50 border border-gray-300 w-full mt-2 rounded shadow-lg bg-white max-h-60 overflow-auto">
                                            {itemSearchResults.map((item) => (
                                                <li
                                                    key={item.name}
                                                    onClick={() => handleSelectItem(index, item)}
                                                    className="p-2 flex flex-col cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-gray-500">{item.purchasePrice}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Input
                                        type="number"
                                        name="hsn"
                                        value={row.hsn}
                                        onChange={(e) => handleChangeRow(index, e)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        name="quantity"
                                        value={row.quantity}
                                        onChange={(e) => handleChangeRow(index, e)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="text"
                                        name="unit"
                                        value={row.unit}
                                        onChange={(e) => handleChangeRow(index, e)}
                                        className='lg:w-full w-24'
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        name="rate"
                                        value={row.rate}
                                        onChange={(e) => handleChangeRow(index, e)}
                                        className='lg:w-full w-24'
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        name="discount"
                                        value={row.discount}
                                        onChange={(e) => handleChangeRow(index, e)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={row.tax.toString()} // Ensure tax is a string
                                        onValueChange={(value) =>
                                            handleChangeRow(index, {
                                                target: {
                                                    name: 'tax',
                                                    value, // Value is already a string, so no need to parse
                                                },
                                            } as unknown as React.ChangeEvent<HTMLInputElement>)
                                        } // Cast the event as ChangeEvent<HTMLInputElement>
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Tax %" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12">12%</SelectItem>
                                            <SelectItem value="18">18%</SelectItem>
                                            <SelectItem value="28">28%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{row.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(index)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end items-center rounded">
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="mt-4 py-2 px-4 bg-blue-600 text-white rounded flex gap-2 justify-end"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                    Add Row
                </button>
            </div>
            <div className="mt-4 border flex justify-end bg-gray-100 p-5 rounded flex-col">
                <div className="flex justify-end gap-2">
                    <p>Subtotal:</p>
                    <p>
                        {(purchaseData.totalAmount - purchaseData.cgst - purchaseData.sgst).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <p>CGST:</p>
                    <p>
                        {purchaseData.cgst.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <p>SGST:</p>
                    <p>
                        {purchaseData.sgst.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end font-bold gap-2">
                    <p>Total Amount:</p>
                    <p>
                        {purchaseData.totalAmount.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
            </div>

            {error && <div className="text-red-600 mt-4">{error}</div>}
            {success && <div className="text-green-600 mt-4">Purchase order created successfully!</div>}
            <div className='flex gap-4 mt-6'>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={` py-2 px-4 ${loading ? 'bg-gray-400' : 'bg-white'} border border-black text-black rounded justify-center items-center`}
                    disabled={loading}
                >
                    {loading ? 'Creating Purchase Order...' : 'Create Purchase Order'}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className={`py-2 px-4 border border-black bg-black  text-white rounded flex gap-1 justify-center items-center`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                    Cancel
                </button>
                <button onClick={handlePrint} className={`py-2 px-4 border border-black bg-black  text-white rounded flex gap-1 justify-center items-center`}>Print</button>
            </div>
        </div>
    );
}
