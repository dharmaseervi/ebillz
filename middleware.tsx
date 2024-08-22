import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }

  const token = await getToken({
    req: request,
    secret,
  });

  // Enhanced Debugging Logs
  console.log("Request Path:", path);
  console.log("Token:", token);

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
