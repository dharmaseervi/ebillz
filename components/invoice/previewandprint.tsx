'use client';
import React, { useEffect, useRef, useState } from 'react';
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
    invoiceId: string;
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
    const componentRef = useRef<HTMLDivElement>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerDetails, setCustomerDetails] = useState<any>(null);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [cgst, setCgst] = useState(0);
    const [sgst, setSgst] = useState(0);
    console.log(invoiceid ,'IDDDD');

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoice?id=${invoiceid}`);
            const data = await res.json();
            console.log(data);
            
            if (data.success) {
                setInvoice(data.invoice);
                setCustomerAddress(`${data.invoice.customerId.address}, ${data.invoice.customerId.city}, ${data.invoice.customerId.state}, ${data.invoice.customerId.zip}`);
                setCustomerDetails(data.invoice.customerId);
                let total = 0;
                let totalTax = 0;
                data.invoice.items.forEach((item) => {
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
                console.log(sub);

                setSubtotal(sub);
                setCgst(cgst);
                setSgst(sgst);
                setTotal(total);
            } else {
                console.error('Error fetching invoice:', data.message);
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

    return (
        <div className='p-4 max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-lg' style={{ width: '210mm', minHeight: '297mm' }}>
            <div className='p-4 flex justify-center items-center gap-2 border-b border-gray-300 mb-4'>
                <div className='flex flex-col justify-center items-center w-3/3'>
                    <img src="/4.png" alt="" className='w-full h-24 object-cover mb-2' />
                    <p className='text-sm text-gray-700 font-medium'>Bettadapura road, opposite Navanagara bank, Periyapatna-571107</p>
                    <p className='text-sm text-gray-700 font-medium'>GST NO: 29CQTPP361KZY</p>
                    <p className='text-sm text-gray-700 font-medium'>MOB: 9900376308</p>
                    <p className='text-sm text-gray-700 font-medium'>Email: sridurga.sd2017@gmail.com</p>
                </div>
            </div>
            <div className='grid grid-cols-2 border-b border-gray-300 mb-4'>
                <div className='flex flex-col p-4'>
                    {customerAddress && (
                        <>
                            <div className="">
                                <p className='text-lg text-gray-800 uppercase font-medium'>{customerDetails.fullName}</p>
                                <p className='text-sm text-gray-600'>{customerAddress}</p>
                            </div>
                            <div className="mb-2">
                                <p className='text-sm text-gray-600'>GST No: URP</p>
                                <p className='text-sm text-gray-600'>State Name: {customerDetails.state}</p>
                                <p className='text-sm text-gray-600'>Email: {customerDetails.email}</p>
                                <p className='text-sm text-gray-600'>Mobile: {customerDetails.phone}</p>
                            </div>
                        </>
                    )}
                </div>
                <div className='flex flex-col p-4'>
                    <p className='text-lg text-gray-800 font-medium mb-2'>Invoice Details</p>
                    <p className='text-sm text-gray-600'>Invoice No: {invoice?.invoiceNumber}</p>
                    <p className='text-sm text-gray-600'>Invoice Date: {invoice?.invoiceDate ? formatDate(invoice.invoiceDate) : ''}</p>
                    <p className='text-sm text-gray-600'>Invoice Due Date: {invoice?.dueDate ? formatDate(invoice.dueDate) : ''}</p>
                </div>
            </div>
            <div className='mt-2 border border-gray-900' >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[10px]">No</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>HSN/SAC</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Disc %</TableHead>
                            <TableHead>Tax %</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice?.items?.map((item, index) => (
                            <TableRow key={item._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className='text-sm '>{item.itemDetails}</TableCell>
                                <TableCell>{item.hsn}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>{item.rate}</TableCell>
                                <TableCell>{item.discount}</TableCell>
                                <TableCell>{item.tax}%</TableCell>
                                <TableCell>{item.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={7}></TableCell>
                            <TableCell className='font-bold'>Subtotal</TableCell>
                            <TableCell>{subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className='mt-4 grid grid-cols-3 gap-4'>
                <div className='border border-gray-300 p-4 col-span-2'>
                    <p className='text-md text-gray-800 font-medium mb-2'>Amount in Words: {toWords.convert(total, { currency: true, ignoreDecimal: true })}</p>
                    <p className='text-md text-gray-800 font-medium mb-2'>Bank Details:</p>
                    <p className='text-sm text-gray-600'>Bank Name: [Your Bank Name]</p>
                    <p className='text-sm text-gray-600'>Account Number: [Your Account Number]</p>
                    <p className='text-sm text-gray-600'>IFSC Code: [Your IFSC Code]</p>
                </div>
                <div className='border border-gray-300 p-4'>
                    <div className='flex justify-between mb-2'>
                        <p className='font-bold text-gray-800'>CGST:</p>
                        <p className='text-gray-600'>{cgst.toFixed(2)}</p>
                    </div>
                    <div className='flex justify-between mb-2'>
                        <p className='font-bold text-gray-800'>SGST:</p>
                        <p className='text-gray-600'>{sgst.toFixed(2)}</p>
                    </div>
                    <div className='flex justify-between'>
                        <p className='font-bold text-gray-800'>Total:</p>
                        <p className='text-gray-600'>{total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div className='mt-4 border border-gray-300 p-4'>
                <p className='text-md text-gray-800 font-medium mb-2'>Terms and Conditions:</p>
                <ul className='list-disc list-inside text-sm text-gray-600'>
                    <li>Payment is due within 30 days.</li>
                    <li>Late payments may incur additional charges.</li>
                    <li>Goods once sold cannot be returned.</li>
                </ul>
            </div>
        </div>
    );
}
