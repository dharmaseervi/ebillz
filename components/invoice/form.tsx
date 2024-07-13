'use client'
import React, { useState, FormEvent, ChangeEvent, FocusEvent, MouseEvent } from 'react';
import CustomerForm from './CustomerForm';

interface Customer {
    _id: string;
    fullName: string;
    // Add more fields as needed
}

interface FormData {
    invoiceNumber: string;
    customerName: string;
    amount: string;
    dueDate: string;
    // Add more fields as needed
}

export default function Form() {
    const [formData, setFormData] = useState<FormData>({
        invoiceNumber: '',
        customerName: '',
        amount: '',
        dueDate: '',
    });
    const [isFocused, setIsFocused] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        setTimeout(() => setIsFocused(false), 100); // Delay to allow clicking on the dropdown items
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCustomerSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setCustomerSearch(value);

        const res = await fetch(`/api/customers?search=${value}`);
        const data = await res.json();

        if (res.ok) {
            setSearchResults(data.customers);
        } else {
            console.error('Failed to fetch customers:', data.message || 'Unknown error');
            setSearchResults([]);
        }
    };

    const handleAddNewCustomer = () => {
        setShowAddCustomerForm(true);
        setCustomerSearch('');
        setSearchResults([]);
    };

    const handleCancelAddCustomer = () => {
        setShowAddCustomerForm(false);
        setFormData({ ...formData, customerName: '' }); // Reset customerName field
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(formData);
        // Reset form fields if needed
        setFormData({
            invoiceNumber: '',
            customerName: '',
            amount: '',
            dueDate: '',
        });
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Create Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice Number</label>
                    <input
                        type="text"
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="relative">
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        onInput={handleCustomerSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                    {isFocused && searchResults.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                            {searchResults.map((customer) => (
                                <li
                                    key={customer._id}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                    onMouseDown={(e) => {
                                        handleChange({
                                            target: {
                                                name: 'customerName',
                                                value: customer.fullName,
                                            } as HTMLInputElement,
                                        } as ChangeEvent<HTMLInputElement>);
                                        setIsFocused(false);
                                    }}
                                >
                                    {customer.fullName}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {showAddCustomerForm ? (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                        <div className="w-5/6 md:w-1/2 bg-white p-4 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-5">Add New Customer</h3>
                            <CustomerForm cancel={handleCancelAddCustomer} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                            onClick={handleAddNewCustomer}
                        >
                            Add New Customer
                        </button>
                    </div>
                )}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                {/* Add more fields as needed */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
