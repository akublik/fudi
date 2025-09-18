
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// This forces the middleware to run on the Node.js runtime.
export const runtime = 'nodejs'

// List of admin UIDs allowed to access the /admin route
const ADMIN_UIDS = ['251eSg9I6XM5QYyY3n5c6O3qS6p1'];

// Initialize Firebase Admin directly in the middleware
function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }
  try {
    admin.initializeApp();
  } catch (error: any) {
    if (error.code === 'duplicate-app') {
      console.warn('Firebase admin already initialized.');
    } else {
      console.error('Firebase admin initialization error', error);
    }
  }
}

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
    const tokenCookie = request.cookies.get('firebaseIdToken');
    const token = tokenCookie?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    const uid = await verifyToken(token);

    if (!uid || !ADMIN_UIDS.includes(uid)) {
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
