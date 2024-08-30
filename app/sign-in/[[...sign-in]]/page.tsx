import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400">
      <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg ring-1 ring-gray-300">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Welcome Back</h1>
        <SignIn
          path="/sign-in"
          routing="path"
          signInButtonProps={{
            className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
          }}
          signUpButtonProps={{
            className: "w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-2 rounded-lg shadow-md hover:from-gray-400 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50",
          }}
        />
      </div>
    </div>
  );
}
