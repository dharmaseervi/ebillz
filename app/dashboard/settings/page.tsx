'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import CompanyForm from '@/components/company/companyForm';

// Define type for Company
interface Company {
  _id: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
}

const CompanyList = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null); // Define proper types for state
  const [showForm, setShowForm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null); // Track deletion process

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      if (res.ok) {
        setCompanies(data.company);
      } else {
        console.error('Failed to fetch companies:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDelete = async (id: any) => {
    try {
      const res = await fetch(`/api/company?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCompanies();
      } else {
        console.error('Failed to delete company');
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingCompany(null);
    fetchCompanies();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>Manage all the companies in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
            <Dialog open={showForm} onOpenChange={setShowForm} >
              <DialogTrigger asChild>
                <Button className="flex items-center bg-blue-500 text-white py-2 px-4 rounded">
                  <PlusCircle className="mr-2" size={18} /> Create New Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCompany ? 'Edit Company' : 'Create Company'}</DialogTitle>
                  <DialogDescription>
                    {editingCompany ? 'Edit the details of the company.' : 'Fill in the details to create a new company.'}
                  </DialogDescription>
                </DialogHeader>
                <CompanyForm
                  onSuccess={handleSuccess}
                  cancel={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                  }}
                  company={editingCompany}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Zip</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>{company.address}</TableCell>
                  <TableCell>{company.city}</TableCell>
                  <TableCell>{company.state}</TableCell>
                  <TableCell>{company.zip}</TableCell>
                  <TableCell>{company.contactNumber}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.gstNumber}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEdit(company)} className="flex items-center bg-yellow-500 text-white py-1 px-2 rounded">
                        <Edit3 className="mr-1" size={16} /> Edit
                      </Button>
                      <Button onClick={() => handleDelete(company._id)} className="flex items-center bg-red-500 text-white py-1 px-2 rounded">
                        <Trash2 className="mr-1" size={16} /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyList;
