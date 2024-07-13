'use client'
import React, { useState, FormEvent, ChangeEvent, } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
    const [register, setRegister] = useState({
        name: '',
        email: '',
        password: ''
    });
    const router = useRouter();
    const [error, setError] = useState('');

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegister(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const res = await fetch("/api/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(register),
            });
            if (!res.ok) {
                const errorMessage = await res.text();
                setError('user already exists')
                throw new Error(errorMessage);
            }
            const data = await res.json();
            console.log(data);
            router.push('/auth/sign-in');
        } catch (error) {
            setError('An error occurred. Please try again later.');
            console.error(error);
        }
    };
    

    

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign Up</h2>
                <p className="mb-6 text-gray-600 text-center">
                    Nice to meet you! Enter your details to register.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                name="name"
                                value={register.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Your Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                name="email"
                                value={register.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                name="password"
                                value={register.password}
                                onChange={handleInputChange}
                            />
                        </div>

                        {error && (<p className='text-red-600'>{error}</p>)}
                    </div>
                    <Button type="submit" className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign Up
                    </Button>
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/auth/sign-in" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign In
                        </Link>
                    </div>
                   
                </form>
            </div>
        </div>
    );
}
