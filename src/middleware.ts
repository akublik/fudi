
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './lib/firebase-admin';

// List of admin UIDs allowed to access the /admin route
const ADMIN_UIDS = ['251eSg9I6XM5QYyY3n5c6O3qS6p1']; 

async function verifyToken(token: string) {
  try {
    initFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('firebaseIdToken')?.value;

    if (!token) {
      // Redirect to home if no token is found
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    const uid = await verifyToken(token);
    
    if (!uid || !ADMIN_UIDS.includes(uid)) {
      // Redirect to home if user is not an admin
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
