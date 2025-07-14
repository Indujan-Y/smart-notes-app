import { NextResponse, type NextRequest } from 'next/server';
import { getInitialUser } from './lib/firebase-admin';

async function verifyAuth(request: NextRequest) {
  const idToken = request.cookies.get('idToken')?.value;
  if (!idToken) {
    return null;
  }
  
  // To verify the token, we need to pass it in a header,
  // similar to how getInitialUser expects it.
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${idToken}`);

  // Create a new request with the Authorization header
  const newRequest = new NextRequest(request.nextUrl, { headers });
  
  try {
    // We can't directly call getInitialUser as it reads headers from a global store
    // that isn't available in middleware. We'll simulate its logic.
    const { auth } = await import('./lib/firebase-admin');
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    return null;
  }
}


export async function middleware(request: NextRequest) {
  const user = await verifyAuth(request);
  const { pathname } = request.nextUrl;

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (user && (pathname === '/' || pathname === '/signup')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add the auth token to the request headers for API routes or server components
  const requestHeaders = new Headers(request.headers);
  const idToken = request.cookies.get('idToken')?.value;
  if (idToken) {
    requestHeaders.set('Authorization', `Bearer ${idToken}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/', '/signup', '/dashboard/:path*'],
};
