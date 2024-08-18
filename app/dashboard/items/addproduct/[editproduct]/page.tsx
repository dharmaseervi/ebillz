'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface UpdateProductFormProps {
    productId: string;
    params: { editproduct: string }
}

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
 const UpdateProductForm: React.FC<UpdateProductFormProps> = ({ params, }) => {
    const { editproduct } = params;
    const productId = editproduct
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
            console.log(res);

            router.push('/dashboard/items');
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };
    console.log(formData);


    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-full mx-auto rounded p-16">
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
                    autoComplete="off"
                />
            </div>
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                >
                    <option value="">Select Unit</option>
                    {unitOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700">HSN Code</label>
                <input
                    type="text"
                    id="hsnCode"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">Selling Price (INR)</label>
                <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    required
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Update Product
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="border-indigo-600 border bg-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default UpdateProductForm;
