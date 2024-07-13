import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import UserRegister from "@/modules/userregister";
import bcrypt from "bcryptjs";
import connectDB from "@/utils/mongodbConnection";
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import ClientPromise from './utils/db';
import NodemailerProvider from 'next-auth/providers/nodemailer';
import sendVerificationRequest from '@/utils/sendVerificationRequest';

interface CredentialsType {
    email: string;
    password: string;
}
interface CustomUser {
    _id: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        NodemailerProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: sendVerificationRequest,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { email, password } = credentials as CredentialsType

                // Ensure MongoDB is connected
                await connectDB();

                try {
                    // Find the user by email
                    const user = await UserRegister.findOne({ email });
                    if (!user) {
                        console.log('User not found');
                        return null;
                    }

                    // Compare the hashed password
                    const isValid = await bcrypt.compare(password, user.password);
                    if (isValid) {
                        console.log('User:', user);
                        return user;
                    } else {
                        console.log('Invalid credentials');
                        return null;
                    }
                } catch (error) {
                    console.error('Error during authentication:', error);
                    return null;
                }
            },
        }),
    ],
    adapter: MongoDBAdapter(ClientPromise),
    pages: {
        signIn: "/auth/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: (user as CustomUser)._id,
                };
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    _id: token.id ,
                },
            };
        },
    },
});

// Default export for NextAuth
export default NextAuth;
