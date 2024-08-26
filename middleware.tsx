import { getToken } from '@auth/core/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error("Missing JWT_SECRET environment variable.");
    return NextResponse.redirect(new URL('/auth/sign-in', request.nextUrl));
  }

  try {
    // Extract token from cookies instead of headers
    const token = await getToken({
      req: request,
      secret,
    });

    const privatePaths = [
      '/dashboard',
      '/clients',
      '/expenses',
      '/invoice',
      '/items',
      '/reports',
      '/settings',
    ];

    const isPrivatePath = privatePaths.some((privatePath) => path.startsWith(privatePath));

    if (!token && isPrivatePath) {
      console.log("Redirecting to login due to missing token.");
      return NextResponse.redirect(new URL('/auth/sign-in', request.nextUrl));
    }

  } catch (error) {
    console.error("Error processing token:", error);
    return NextResponse.redirect(new URL('/auth/sign-in', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/expenses/:path*',
    '/invoice/:path*',
    '/items/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
