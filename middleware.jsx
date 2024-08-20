import { getToken } from "@auth/core/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const path = request.nextUrl.pathname;

    // Ensure secret and salt are defined and available from environment variables
    const secret = process.env.AUTH_SECRET;

    if (!secret || !salt) {
        throw new Error("Missing AUTH_SECRET or JWT_SALT environment variables.");
    }


    const token = await getToken({
        req: request,
        secret,

    });

    console.log("Token:", token); // Debugging

    const privatePaths = ["/dashboard", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"];
    const isPrivatePath = privatePaths.some((privatePath) => path.startsWith(privatePath));

    // If token does not exist and user tries to access private path, redirect to login
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
