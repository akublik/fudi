
import * as admin from 'firebase-admin';

export function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if credentials are provided in environment variables
  const hasEnvCredentials = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  let credentials;
  if (hasEnvCredentials) {
    credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines in private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };
  }

  try {
    return admin.initializeApp({
        // Use credentials if available, otherwise let the SDK use default discovery
        credential: credentials ? admin.credential.cert(credentials) : undefined,
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
