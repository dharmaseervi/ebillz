"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

interface Customer {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface CustomerFormProps {
    params: { editcustomer: string };
}

export default function UpdateCustomerForm({ params }: CustomerFormProps) {
    const { editcustomer } = params;
    const router = useRouter()
    const [formData, setFormData] = useState<Customer>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
    });

      // Navigate back on cancel
      const handleCancel = () => {
        router.push('/dashboard/clients');
    };

    
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`/api/customers?id=${editcustomer}`);
                const data = await res.json();
                if (res.ok && data.customers) {
                    setFormData(data.customers);
                } else {
                    console.error("Failed to fetch customer");
                }
            } catch (error) {
                console.error("Error fetching customer:", error);
            }
        };
        fetchCustomer();
    }, []);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch(`/api/customers?id=${editcustomer}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                console.log("Customer updated successfully");
            } else {
                console.error("Failed to update customer");
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    return (
        <div className=" lg:mx-10 lg:mt-10 mt-5 mx-5 border lg:bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Update Customer Information</h2>
            <div className="space-y-4">
                <div className="grid  gap-4">
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700"
                        >
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700"
                        >
                            State
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="zip"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Zip Code
                        </label>
                        <input
                            type="text"
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Update Customer
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
