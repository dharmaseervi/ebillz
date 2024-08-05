'use client'
import React from 'react';

import InvoiceTable from '@/components/invoice/InvoiceTable';
import { useRouter } from 'next/navigation';

export default function Invoices() {
    const router = useRouter();

    const navigateToAddInvoice = () => {
        router.push('invoices/createinvoice');
    };

    return (
        <div className='flex flex-col gap-2 p-6'>
            <div>
                <button className='hover:bg-black-200 bg-black-100 text-white rounded px-4 py-2 flex gap-1 text-center' onClick={navigateToAddInvoice}>
                    Create Invoice
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
            </div>
            <div>
                <InvoiceTable />
            </div>
        </div>
    );
}
