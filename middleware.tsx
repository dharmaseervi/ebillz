import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ensure the secret is available from environment variables
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }

  const token = await getToken({
    req: request,
    secret,
  });

  // Define paths that require authentication
  const privatePaths = [

    "/dashboard",
    "/clients",
    "/expenses",
    "/invoice",
    "/items",
    "/reports",
    "/settings",
  ];

  const isPrivatePath = privatePaths.some((privatePath) =>
    path.startsWith(privatePath)
  );

  console.log("Token:", token);
  console.log("Path:", path);

  // Redirect to login if token is missing and trying to access a protected route
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
    "/settings/:path*",
  ],
};
