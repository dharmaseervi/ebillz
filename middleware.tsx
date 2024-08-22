import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }

  // Extract token from request headers
  const token = request.headers.get('_vercel_jwt') || await getToken({
    req: request,
    secret,
  });

  // Debugging logs
  console.log("Request Path:", path);
  console.log("Token:", token);
  console.log("Request Headers:", request.headers);

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

  if (!token && isPrivatePath) {
    console.log("Redirecting to login due to missing token.");
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
