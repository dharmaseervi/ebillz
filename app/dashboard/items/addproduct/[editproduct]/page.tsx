'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
    name: string;
    unit: string;
    hsnCode: string;
    sellingPrice: number;
    quantity: number;
    description: string;
}

const initialFormData: FormData = {
    name: '',
    quantity: 0,
    unit: '',
    hsnCode: '',
    sellingPrice: 0,
    description: '',
};

const unitOptions = [
    { value: 'mtr', label: 'Meter (mtr)' },
    { value: 'sqmtr', label: 'Square Meter (sq mtr)' },
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'box', label: 'Box' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kgs', label: 'Kilograms (kgs)' },
];

const UpdateProductForm: React.FC<{ productId: string }> = ({ productId }) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/items?id=${productId}`);
                if (!res.ok) throw new Error('Failed to fetch product');
                const data = await res.json();
                setFormData(data.filterData);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        router.push('/dashboard/items');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/items?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ formData }),
            });
            if (!res.ok) throw new Error('Failed to update product');
            router.push('/dashboard/items');
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-full mx-auto rounded p-16">
            {/* Form Fields */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            {/* Additional Form Fields */}
            {/* Other Fields like quantity, unit, etc. */}
            <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm">
                    Update Product
                </button>
                <button type="button" onClick={handleCancel} className="border-indigo-600 border bg-white py-2 px-4 rounded-md shadow-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default function UpdateProductPage({ params }: { params: { editproduct: string } }) {
    return <UpdateProductForm productId={params.editproduct} />;
}
