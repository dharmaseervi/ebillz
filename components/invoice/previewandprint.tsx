'use client';
import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ToWords } from 'to-words';

interface PreviewandprintProps {
    invoiceid: string;
}

interface InvoiceItem {
    _id: string;
    itemDetails: string;
    hsn: number;
    quantity: number;
    unit: string;
    rate: number;
    discount: number;
    tax: number;
    amount: number;
}

interface Invoice {
    customerId: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        email: string;
        phone: string;
    };
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: InvoiceItem[];
}




const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
            name: 'Rupee',
            plural: 'Rupees',
            symbol: '₹',
            fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: '',
            },
        },
    },
});

export default function Previewandprint({ invoiceid }: PreviewandprintProps) {
    const itemsPerPage = 11; 
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [cgst, setCgst] = useState(0);
    const [sgst, setSgst] = useState(0);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoice?id=${invoiceid}`);
            const data = await res.json();
            if (data.success) {
                setInvoice(data.invoice);

                let total = 0;
                let totalTax = 0;
                data.invoice.items.forEach((item: { amount: number; tax: number; }) => {
                    total += item.amount;

                    if (item.tax === 18) {
                        totalTax += item.amount - (item.amount / 1.18);
                    } else {
                        totalTax += item.amount / 1.28;
                    }
                });

                const cgst = totalTax / 2;
                const sgst = totalTax / 2;
                const sub = total - cgst - sgst;

                setSubtotal(sub);
                setCgst(cgst);
                setSgst(sgst);
                setTotal(total);

                const pageCount = Math.ceil(data.invoice.items.length / itemsPerPage);
                setTotalPages(pageCount);
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
        }
    };

    useEffect(() => {
        if (invoiceid) {
            fetchInvoice();
        }
    }, [invoiceid]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-GB');
    };

    // Paginate items by limiting items per page
    const paginatedItems = invoice?.items?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className='p-4 max-w-4xl mx-auto border border-gray-900 ' style={{ width: '210mm', minHeight: '100mm' }}>
            {/* Header Section */}
            <div className='p-4 flex justify-center items-center gap-2 border-b border-gray-900 mb-2'>
                <div className='flex flex-col justify-center items-center w-3/3'>
                    <img src="/4.png" alt="" className='w-full h-20 object-cover mb-1' />
                    <p className='text-xs text-gray-700 font-medium'>Bettadapura road, opposite Navanagara bank, Periyapatna-571107</p>
                    <p className='text-xs text-gray-700 font-medium'>GST NO: 29CQTPP361KZY</p>
                    <p className='text-xs text-gray-700 font-medium'>MOB: 9900376308</p>
                    <p className='text-xs text-gray-700 font-medium'>Email: sridurga.sd2017@gmail.com</p>
                </div>
            </div>

            {/* Customer and Invoice Details */}
            <div className='grid grid-cols-2 border-b border-gray-900 mb-2'>
                <div className='flex flex-col p-2 text-xs border-r border-gray-900'>
                    {invoice?.customerId?.address && (
                        <>
                            <p className='text-sm text-gray-800 uppercase font-medium'>{invoice?.customerId.fullName}</p>
                            <p className='text-xs text-gray-600'>{invoice.customerId.address}, {invoice.customerId.city}, {invoice.customerId.state}, {invoice.customerId.zip}</p>
                            <div className="mb-1">
                                <p className='text-xs text-gray-600'>GST No: URP</p>
                                <p className='text-xs text-gray-600'>State Name: {invoice.customerId.state}</p>
                                <p className='text-xs text-gray-600'>Email: {invoice.customerId.email}</p>
                                <p className='text-xs text-gray-600'>Mobile: {invoice.customerId.phone}</p>
                            </div>
                        </>
                    )}
                </div>
                <div className='flex flex-col p-2 text-xs'>
                    <p className='text-sm text-gray-800 font-medium mb-1'>Invoice Details</p>
                    <p className='text-xs text-gray-600'>Invoice No: {invoice?.invoiceNumber}</p>
                    <p className='text-xs text-gray-600'>Invoice Date: {invoice?.invoiceDate ? formatDate(invoice.invoiceDate) : ''}</p>
                    <p className='text-xs text-gray-600'>Invoice Due Date: {invoice?.dueDate ? formatDate(invoice.dueDate) : ''}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className='mt-1 border border-gray-900 min-h-[100mm]' style={{ minHeight: '140mm' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5px] text-xs border-r border-gray-900">No</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Items</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>HSN/SAC</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Qty</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Unit</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Rate</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Disc %</TableHead>
                            <TableHead className='text-xs border-r border-gray-900'>Tax %</TableHead>
                            <TableHead className='text-xs'>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems?.map((item, index) => (
                            <TableRow key={item._id} className='border-b border-gray-900'>
                                <TableCell className='text-xs border-r border-gray-900'>{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.itemDetails}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.hsn}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.quantity}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.unit}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.rate}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.discount}</TableCell>
                                <TableCell className='text-xs border-r border-gray-900'>{item.tax}%</TableCell>
                                <TableCell className='text-xs'>{item.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}

                        <TableRow className='border-b border border-gray-900'>
                            <TableCell colSpan={7}></TableCell>
                            <TableCell className='font-bold  border-gray-900'>Subtotal</TableCell>
                            <TableCell>{subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div>
                {/* Bank Details and CGST/SGST */}
                <div className='mt-2 grid grid-cols-3 gap-2 text-xs'>
                    <div className='border border-gray-900 p-2 col-span-2'>
                        <p className='text-sm text-gray-800 font-medium mb-1'>Amount in Words: {toWords.convert(total, { currency: true, ignoreDecimal: true })}</p>
                        <p className='text-sm text-gray-800 font-medium mb-1'>Bank Details:</p>
                        <p>Bank Name: [Your Bank Name]</p>
                        <p>Account Number: [Your Account Number]</p>
                        <p>IFSC Code: [Your IFSC Code]</p>
                    </div>
                    <div className='border border-gray-900 p-2'>
                        <div className='flex justify-between mb-1'>
                            <p className='font-bold text-gray-800'>CGST:</p>
                            <p className='text-gray-600'>{cgst.toFixed(2)}</p>
                        </div>
                        <div className='flex justify-between mb-1'>
                            <p className='font-bold text-gray-800'>SGST:</p>
                            <p className='text-gray-600'>{sgst.toFixed(2)}</p>
                        </div>
                        <div className='flex justify-between'>
                            <p className='font-bold text-gray-800'>Total:</p>
                            <p className='text-gray-600'>{total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className='mt-2 border border-gray-900 p-2'>
                    <p className='text-xs text-gray-800 font-medium mb-1'>Terms and Conditions:</p>
                    <ul className='list-disc list-inside text-xs text-gray-600'>
                        <li>Payment is due within 30 days.</li>
                        <li>Late payments may incur additional charges.</li>
                        <li>Goods once sold cannot be returned.</li>
                    </ul>
                </div>
            </div>

            {/* Pagination */}
            <div className='text-right text-xs mt-2'>
                Page {currentPage} of {totalPages}
            </div>
        </div>
    );
}
