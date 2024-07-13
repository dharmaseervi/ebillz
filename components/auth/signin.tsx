'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Corrected import
import { signIn } from 'next-auth/react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from 'lucide-react';
import { FormEvent } from 'react';

export default function SigninPage() {
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: user.email,
                password: user.password,
            });

            if (res.error) {
                setError(res.error);
                return;
            }

            console.log(res, 'res');
            router.push("/");
        } catch (error) {
            console.error(error);
            setError('An unexpected error occurred.');
        }
    };

    const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signIn('nodemailer', { email: user.email, callbackUrl: '/' });
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-2xl font-semibold text-center mb-4">
                    Sign In
                </div>
                <p className="text-center text-gray-600 mb-8">
                    Nice to meet you! Enter your details to login.
                </p>
                <form className="mt-8 mb-2" onSubmit={handleSubmit}>
                    <div className="mb-1 flex flex-col gap-6">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">
                                Your Email
                            </Label>
                            <Input
                                placeholder="Enter your email"
                                className="border-t-blue-gray-200 focus:border-t-gray-900" // Corrected className
                                name="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="password">
                                Password
                            </Label>
                            <Input
                                type="password"
                                placeholder="********"
                                className="border-t-blue-gray-200 focus:border-t-gray-900" // Corrected className
                                name="password"
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                    <Button type="submit" className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign In
                    </Button>
                    <div className="mt-4 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/auth/sign-up">
                            <p className="font-medium text-gray-900">Sign Up</p>
                        </Link>
                    </div>
                    <Button type="button" onClick={handleEmailSignIn} className="w-full mt-2 flex items-center justify-center bg-gray-100 text-gray-900 py-2 px-4 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        <Mail className="mr-2 h-4 w-4" /> Login with Email
                    </Button>
                </form>
            </div>
        </div>
    );
}
