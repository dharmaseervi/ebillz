import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: any) {
    const path = request.nextUrl.pathname;

    const secret = process.env.NEXTAUTH_SECRET; // Make sure this is always defined
    const salt = process.env.JWT_SALT; // Make sure this is always defined as well

    if (!secret || !salt) {
        throw new Error("NEXTAUTH_SECRET or JWT_SALT is not defined in environment variables");
    }

    const token = await getToken({
        req: request,
        secret,
    });

    const privatePaths = ["/dashboard", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"];
    const isPrivatePath = privatePaths.some((privatePath) => path.startsWith(privatePath));

    if (!token && isPrivatePath) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/clients/:path*",
        "/expenses/:path*",
        "/invoice/:path*",
        "/items/:path*",
        "/reports/:path*",
        "/settings/:path*"
    ],
};
