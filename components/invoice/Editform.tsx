'use client';
import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import CustomerForm from './CustomerForm';
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
import { useRouter, useParams } from 'next/navigation';

interface Customer {
    _id: string;
    fullName: string;
    address: string;
    city: string;
    state: string;
    email: string;
    phone: string;
    zip: string;
}

interface Item {
    name: string;
    hsnCode: number;
    sellingPrice: number;
    description: string;
    unit: string;
}

interface Row {
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
    invoiceNumber: number;
    customerName: string;
    customerId?: string;
    invoiceDate: string;
    dueDate: string;
    items: Row[];
    totalAmount: number,
}
interface EditInvoiceFormProps {
    invoiceId: string;
}
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({ invoiceId }) => {
    const [formData, setFormData] = useState<FormData>({
        invoiceNumber: 0,
        customerName: '',
        invoiceDate: formatDate(new Date()),
        dueDate: '',
        items: [],
        totalAmount: 0,
    });
    const [isFocused, setIsFocused] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [rows, setRows] = useState<Row[]>([
        { itemDetails: '', hsn: 0, quantity: 1, rate: 0, discount: 0, tax: 18, amount: 0, desc: '', unit: '' },
    ]);
    const [itemSearchResults, setItemSearchResults] = useState<Item[]>([]);
    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
    const [customerAddress, setCustomerAddress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        totalAmount: 0,
        cgst: 0,
        sgst: 0,
    });
    const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
    const router = useRouter();

    console.log(rows);


    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const res = await fetch(`/api/invoice?id=${invoiceId}`);
                const data = await res.json();
                console.log(data);

                if (res) {
                    setFormData(data.invoice);
                    setRows(data.invoice.items);
                    setCustomerSearch(data.invoice.customerName)
                    setCustomerDetails(data.invoice.customer);
                    setCustomerAddress(`${data.invoice.customer.address}, ${data.invoice.customer.city}, ${data.invoice.customer.state}, ${data.invoice.customer.zip}`);
                } else {
                    setError('Failed to fetch invoice data');

                }
            } catch (error) {
                setError('');
            }
        };

        fetchInvoiceData();
    }, [invoiceId]);

    useEffect(() => {
        setFormData({ ...formData, items: rows });
    }, [rows]);

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

        setInvoiceData({
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

    const fetchCustomer = useCallback(
        debounce(async (value: string) => {
            try {
                const res = await fetch(`/api/customers?search=${value}`);
                const data = await res.json();
                if (res.ok) {
                    setSearchResults(data.customers);
                } else {
                    console.error('Failed to fetch customers:', data.message || 'Unknown error');
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Failed to fetch customers:', error);
                setSearchResults([]);
            }
        }, 10),
        []
    );

    const handleCustomerSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setCustomerSearch(value);
        fetchCustomer(value);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setFormData({
            ...formData,
            customerName: customer.fullName,
            customerId: customer._id,
        });
        setCustomerAddress(`${customer.address}, ${customer.city}, ${customer.state}, ${customer.zip}`);
        setCustomerDetails(customer);
        setSearchResults([]);
    };

    const handleAddNewCustomer = () => {
        setShowAddCustomerForm(true);
        setCustomerSearch('');
        setSearchResults([]);
    };

    const handleCancelAddCustomer = () => {
        setShowAddCustomerForm(false);
        setFormData({ ...formData, customerName: '' });
    };

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);

        const updatedFormData = {
            ...formData,
            items: rows,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            totalAmount: invoiceData.totalAmount,
        };
        try {
            // Update invoice
            const invoiceRes = await fetch(`/api/invoice?id=${invoiceId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFormData),
            });

            if (!invoiceRes.ok) {
                const errorData = await invoiceRes.json();
                throw new Error(errorData.error || 'Failed to update invoice');
            }

            // Update items
            const updates = updatedFormData.items;
            console.log(updates);

            const itemsRes = await fetch(`/api/items`, { // Ensure the endpoint matches your API
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            if (!itemsRes.ok) {
                const errorData = await itemsRes.json();
                throw new Error(errorData.error || 'Failed to update items');
            }

            const invoiceData = await invoiceRes.json();
            const itemsData = await itemsRes.json();
            console.log('Invoice Data:', invoiceData);
            console.log('Items Data:', itemsData);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                router.push(`/dashboard/invoices/${invoiceId}`);
            }, 2000);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/invoices/${invoiceId}`);
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

    return (
        <div className="max-w-full mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Update Invoice</h2>
            <div className="space-y-2">
                <div className="grid gap-6 max-w-sm">
                    <div className="">
                        <div className="relative">
                            <label htmlFor="customerName" className="block font-medium">Customer Name</label>
                            <Input
                                type="text"
                                name="customerName"
                                value={customerSearch}
                                onChange={handleCustomerSearch}
                                className="w-full border border-gray-300 p-2 rounded"
                                onBlur={() => setTimeout(() => setIsFocused(false), 100)}

                            />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg">
                                    {searchResults.map((customer) => (
                                        <li
                                            key={customer._id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                        >
                                            {customer.fullName}
                                        </li>
                                    ))}
                                    <li
                                        onClick={handleAddNewCustomer}
                                        className="p-2 cursor-pointer hover:bg-gray-100 text-blue-500"
                                    >
                                        + Add new customer
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className={`bg-black bg-opacity-50 backdrop-blur-sm fixed inset-0 z-40 ${showAddCustomerForm ? 'flex' : 'hidden'} items-center justify-center`}>
                            <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-lg z-50">
                                <h3 className="font-medium mb-2">Add New Customer</h3>
                                <CustomerForm
                                    cancel={handleCancelAddCustomer}
                                    onSuccess={(customer) => {
                                        setFormData({
                                            ...formData,
                                            customerName: customer.fullName,
                                            customerId: customer._id,
                                        });
                                        setShowAddCustomerForm(false);
                                    }}
                                />
                            </div>
                        </div>

                        {customerAddress && (<div className="border mt-2 rounded bg-gray-100 ">
                            <p className='text-md text-black uppercase font-medium'>{customerDetails?.fullName}</p>
                            <p className='text-sm  text-black capitalize'>{customerAddress}</p>
                            <p className='text-sm text-black  capitalize'>GST No:URP</p>
                            <p className='text-sm text-black capitalize'>State Name:{customerDetails?.state}</p>
                            <p className='text-sm text-black  capitalize'>Email:{customerDetails?.email}</p>
                            <p className='text-sm text-black  capitalize'>Mobile:{customerDetails?.phone}</p>
                        </div>)}
                    </div>
                    <div className="">
                        <label htmlFor="invoiceNumber" className="block font-medium">Invoice Number</label>
                        <Input
                            type="text"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>
                    <div className="grid gap-6 grid-cols-2">
                        <div>
                            <label htmlFor="invoiceDate" className="block font-medium">Invoice Date</label>
                            <Input
                                type="text"
                                name="invoiceDate"
                                value={formData.invoiceDate}
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
                                        autoComplete='off'
                                        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                                         className="lg:w-full w-44 "
                                    />
                                    {index === activeRowIndex && isFocused && itemSearchResults?.length > 0 && (
                                        <ul className="absolute z-50 border border-gray-300 w-full mt-2 rounded shadow-lg bg-white max-h-60 overflow-auto">
                                            {itemSearchResults.map((item) => (
                                                <li
                                                    key={item.name}
                                                    onClick={() => handleSelectItem(index, item)}
                                                    className="p-2 flex flex-col cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                                                >
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-gray-500">{item.sellingPrice}</p>
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
                                         className="lg:w-full w-24 "
                                    />
                                </TableCell>
                                <TableCell className="flex items-center">
                                    <Input
                                        type="number"
                                        name="rate"
                                        value={row.rate}
                                        onChange={(e) => handleChangeRow(index, e)}
                                        className="lg:w-full w-24 mr-2"

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
                        {(invoiceData.totalAmount - invoiceData.cgst - invoiceData.sgst).toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <p>CGST:</p>
                    <p>
                        {invoiceData.cgst.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <p>SGST:</p>
                    <p>
                        {invoiceData.sgst.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
                <div className="flex justify-end font-bold gap-2">
                    <p>Total Amount:</p>
                    <p>
                        {invoiceData.totalAmount.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        })}
                    </p>
                </div>
            </div>


            {error && <div className="text-red-600 mt-4">{error}</div>}
            {success && <div className="text-green-600 mt-4">Invoice created successfully!</div>}
            <div className='flex gap-4 mt-6'>
                <button
                    type="button"
                    onClick={handleUpdate}
                    className={` py-2 px-4 ${loading ? 'bg-gray-400' : 'bg-white'} border border-black text-black rounded`}
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Invoice'}
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className={`py-2 px-4 border border-black bg-black  text-white rounded flex gap-1`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                    cancel
                </button>
            </div>
        </div>
    );
};

export default EditInvoiceForm;
