'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReactToPrint } from 'react-to-print';

// Define types for the data
interface LedgerEntry {
  _id: string;
  date: string;
  particulars: string;
  vchType: string;
  vchNo: string;
  debit: number;
  credit: number;
  balance: number;
}

interface Supplier {
  _id: string;
  name: string;
}

interface LedgerPageProps {
  params: {
    supplierId: string;
  };
}

const LedgerPage: React.FC<LedgerPageProps> = ({ params }) => {
  const { supplierId } = params;
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null); // Ref for printing

  const fetchLedgerEntries = async () => {
    try {
      const res = await fetch(`/api/ledger?supplierId=${supplierId}`);
      const data = await res.json();
      setLedgerEntries(data.entries);
    } catch (err) {
      setError("Failed to fetch ledger entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/suppliers?id=${supplierId}`);
      const data = await res.json();
      setSupplier(data.supplier);
    } catch (err) {
      setError("Failed to fetch supplier data");
    }
  };

  const calculateBalance = (entries: LedgerEntry[]) => {
    let runningBalance = 0;
    return entries.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, balance: runningBalance };
    });
  };

  const calculateTotals = (entries: LedgerEntry[]) => {
    let totalDebit = 0;
    let totalCredit = 0;
    entries.forEach(entry => {
      totalDebit += entry.debit;
      totalCredit += entry.credit;
    });
    return { totalDebit, totalCredit };
  };

  useEffect(() => {
    fetchLedgerEntries();
    fetchSupplier();
  }, [supplierId]);

  const ledgerEntriesWithBalance = calculateBalance(ledgerEntries);
  const { totalDebit, totalCredit } = calculateTotals(ledgerEntriesWithBalance);

  const closingBalance = ledgerEntriesWithBalance.length > 0
    ? ledgerEntriesWithBalance[ledgerEntriesWithBalance.length - 1].balance
    : 0;

  const handlePrint = useReactToPrint({
    content: () => cardRef.current, // Specify that we want to print the Card component only
    documentTitle: `Ledger for ${supplier?.name}`,
  });

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div ref={cardRef}>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-4">
              Ledger for {supplier?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-full bg-white mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Date</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Particulars</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Voucher Type</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Voucher No</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Debit</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Credit</TableHead>
                  <TableHead className="text-sm font-medium text-left px-4 py-2 border-b">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntriesWithBalance?.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      {new Date(entry.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      {entry.particulars}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      {entry.vchType}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      {entry.vchNo}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      ₹ {entry.debit?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      ₹ {entry.credit?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 px-4 py-2 border-b">
                      ₹ {entry.balance?.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Add Total Debit, Total Credit, and Closing Balance */}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold text-gray-800 px-4 py-2 border-t">
                    Total
                  </TableCell>
                  <TableCell className="font-bold text-gray-800 px-4 py-2 border-t">
                    ₹ {totalDebit?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="font-bold text-gray-800 px-4 py-2 border-t">
                    ₹ {totalCredit?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="font-bold text-gray-800 px-4 py-2 border-t">
                    Closing Balance: ₹ {closingBalance?.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.push('/dashboard/suppliers')}>
          Back to Suppliers
        </Button>
        <Button onClick={handlePrint} variant="ghost" className='text-indigo-500'>
          Print Ledger
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default LedgerPage;
