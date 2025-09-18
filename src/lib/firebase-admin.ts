
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

export function initFirebaseAdmin() {
  config(); 
  
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const hasEnvCredentials = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  if (!hasEnvCredentials) {
    console.warn('Firebase Admin credentials not found in environment variables. Push notifications will fail.');
    // Attempt to initialize with default credentials, which might work in some environments (like Google Cloud)
    try {
       return admin.initializeApp();
    } catch (e: any) {
      if (e.code !== 'duplicate-app') {
          console.error("Default Firebase admin initialization failed.", e);
          throw e;
      }
      return admin.app();
    }
  }

  const credentials = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  try {
    return admin.initializeApp({
        credential: admin.credential.cert(credentials),
    });
  } catch (error: any) {
    if (error.code === 'duplicate-app') {
      console.warn('Firebase admin already initialized.');
      return admin.app();
    } else {
      console.error('Firebase admin initialization error', error);
      throw error;
    }
  }
}
