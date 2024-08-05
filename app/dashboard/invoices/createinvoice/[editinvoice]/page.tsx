import EditInvoiceForm from '@/components/invoice/Editform';
import React from 'react';

type PageProps = {
    params: {
        editinvoice: string;
    };
};

const Page: React.FC<PageProps> = ({ params }) => {
    const { editinvoice } = params;
    return (
        <div>
            <EditInvoiceForm invoiceId={editinvoice} />
        </div>
    );
};

export default Page;
