import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="lg:grid lg:grid-cols-2 flex w-full h-screen lg:flex-row min-h-screen  justify-center items-center">
      {/* Background Image Section */}
      <div className="hidden lg:flex h-screen relative justify-center items-center bg-gray-900">
        <div className="text-center p-8">
          <Image src="/ebillzo.png" alt="eBillz Logo" width={200} height={200} className='mx-auto mb-4' />
          <h1 className="text-4xl font-bold text-white">Welcome to eBillz</h1>
          <p className="text-white text-lg mt-4">Sign in to access your account</p>
        </div>
      </div>

      {/* Sign In Form Section */}
      <div className=" flex items-center justify-center  bg-white p-8 lg:p-16  ">
        <div className="">
          <div className="flex justify-center mb-6">
            <Image src='/logo.jpg' alt="eBillz Logo" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Welcome Back</h1>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up" // Add sign-up URL if needed
          />
        </div>
      </div>
    </div>
  );
}
