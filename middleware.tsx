import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });
    const privatePaths = ["/dashboard", "/", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"]; // Adjusted the path names

    if (!token && privatePaths.includes(path)) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.nextUrl));
    }
}

export const config = {
    // Matcher for all paths
    matcher: ({ req }) => {
        const privatePaths = ["/dashboard", "/", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"];
        const isPrivatePath = privatePaths.some(path => req.url.startsWith(path));
        return !req.url.startsWith("/api") && isPrivatePath;
    },
};

