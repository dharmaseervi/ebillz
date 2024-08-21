import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Ensure secret and salt are defined and available from environment variables
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET or JWT_SALT environment variables.");
  }

  const token = await getToken({
    req: request,
    secret,
  });

//   console.log("Token:", token); // Debugging

  const privatePaths = [
    "/",
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

  // If token does not exist and user tries to access private path, redirect to login
  if (!token && isPrivatePath) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher for all paths
  matcher: ({ req }) => {
    // Match all routes except for API routes and private paths
    const privatePaths = [
      "/",
      "/dashboard",
      "/clients",
      "/expenses",
      "/invoice",
      "/items",
      "/reports",
      "/settings",
    ];
    const isPrivatePath = privatePaths.some(path => req.url.startsWith(path));
    return !req.url.startsWith("/api") && isPrivatePath;
  },
};
