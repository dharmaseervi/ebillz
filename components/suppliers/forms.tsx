'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the Supplier type
interface Supplier {
    name: string;
    contactNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    gstNumber: string;
}
// Define the types for the props
interface SupplierFormProps {
    onSuccess: (supplier: Supplier) => void;
    cancel: () => void;
    supplier?: Supplier | null;
}
const SupplierForm: React.FC<SupplierFormProps> = ({ onSuccess, cancel, supplier }) => {
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        gstNumber: '',
    });

    useEffect(() => {
        if (supplier) {
            setFormData(supplier);
        }
    }, [supplier]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const method = supplier ? 'PUT' : 'POST';
            const res = await fetch('/api/suppliers', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to save supplier');
            }

            const data = await res.json();
            onSuccess(data.supplier);
            setFormData({
                name: '',
                contactNumber: '',
                email: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                gstNumber: '',
            })
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <Input
                type="text"
                name="name"
                placeholder="Supplier Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
            />
            <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="zip"
                placeholder="Zip Code"
                value={formData.zip}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="gstNumber"
                placeholder="GST Number"
                value={formData.gstNumber}
                onChange={handleChange}
                required
            />
            <div className='flex gap-4'>
                <Button type="submit">
                    {supplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
                <Button type="button" onClick={cancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default SupplierForm;
