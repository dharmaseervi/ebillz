import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background Image Section */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/bg.jpg" // Use a suitable image URL
          alt="Background Image"
          layout="fill"
          objectFit="contain"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div> {/* Optional overlay for better text visibility */}
      </div>

      {/* Sign In Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 shadow-lg rounded-lg">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <Image src='/logo.jpg' alt="eBillz Logo" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Welcome Back</h1>
          <SignIn
            path="/sign-in"
            routing="path"
            appearance={{
              elements: {
                footer: {
                  display: 'none',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
