import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request: any) {
    const path = request.nextUrl.pathname;
    const secret = process.env.AUTH_SECRET;
    const salt = process.env.AUTH_SALT || "default_salt"
    if (!secret) {
        throw new Error("AUTH_SECRET is not defined in environment variables");
    }
    const token = await getToken({
        req: request,
        secret,
        salt,
    });

    const privatePaths = ["/dashboard", "/", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"]; // Adjusted the path names

    if (!token && privatePaths.includes(path)) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.nextUrl));
    }
}

export const config = {
    // Matcher for all paths
    matcher: ({ req }: { req: Request }) => {
        const privatePaths = ["/dashboard", "/", "/clients", "/expenses", "/invoice", "/items", "/reports", "/settings"];
        const isPrivatePath = privatePaths.some(path => req.url.startsWith(path));
        return !req.url.startsWith("/api") && isPrivatePath;
    },
};

