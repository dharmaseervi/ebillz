'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useRouter } from 'next/navigation';

interface Vendor {
  _id: string;
  vendorName: string;
}

interface Item {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrderFormProps {
  onSuccess: (purchaseOrder: any) => void;
  cancel: () => void;
  purchaseOrder?: any; // Add purchaseOrder prop for editing
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onSuccess, cancel, purchaseOrder }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    items: [{ itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    deliveryDate: '',
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      if (res.ok) {
        setVendors(data.vendors);
      } else {
        console.error('Failed to fetch vendors:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  useEffect(() => {
    fetchVendors();
    if (purchaseOrder) {
      setFormData(purchaseOrder);
    }
  }, [purchaseOrder]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [name]: value };
      if (name === 'quantity' || name === 'unitPrice') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      }
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = purchaseOrder ? 'PUT' : 'POST';
      const url = purchaseOrder ? `/api/purchaseOrders?id=${purchaseOrder._id}` : '/api/purchaseOrders';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await res.json();
      onSuccess(data.purchaseOrder);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { itemName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
            Vendor
          </label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={(e) => handleChange(e)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">
            Delivery Date
          </label>
          <Input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={(e) => handleChange(e)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label htmlFor={`itemName-${index}`} className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <Input
                    type="text"
                    name="itemName"
                    value={item.itemName}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <Input
                    type="number"
                    name="unitPrice"
                    value={item.unitPrice}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`totalPrice-${index}`} className="block text-sm font-medium text-gray-700">
                    Total Price
                  </label>
                  <Input
                    type="number"
                    name="totalPrice"
                    value={item.totalPrice}
                    onChange={(e) => handleChange(e, index)}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                    readOnly
                  />
                </div>
                <Button type="button" className="mt-6 bg-red-500 text-white py-1 px-2 rounded" onClick={() => handleRemoveItem(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" className="bg-green-500 text-white py-1 px-2 rounded" onClick={handleAddItem}>
            Add Item
          </Button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-4">
          <Button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded" disabled={loading}>
            {loading ? 'Saving...' : purchaseOrder ? 'Update Purchase Order' : 'Create Purchase Order'}
          </Button>
          <Button type="button" className="bg-gray-500 text-white py-2 px-4 rounded" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
