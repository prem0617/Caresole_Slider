// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    console.log('hello')
  
  // Define public and protected paths
  const isAuthPath = path === '/auth/signin' || path === '/auth/register';
  const isProtectedPath = path === '/profile';
  
  // If the path doesn't require middleware checks, continue
  if (!isAuthPath && !isProtectedPath) {
    return NextResponse.next();
  }

  try {
    // Check if the user is authenticated
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAuthenticated = !!token;

    // Redirect authenticated users away from auth pages
    if (isAuthPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users away from protected pages
    if (isProtectedPath && !isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  } catch (error) {
    console.error('Middleware authentication error:', error);
    // On error, redirect to home page as a fallback
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Otherwise, continue
  return NextResponse.next();
}

// Configure middleware to run on specific paths (use exact paths)
export const config = {
  matcher: ['/profile', '/auth/signin', '/auth/register'],
};