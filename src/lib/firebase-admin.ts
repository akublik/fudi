
import * as admin from 'firebase-admin';

// Re-implement a singleton pattern for Firebase Admin initialization.
let app: admin.app.App | undefined;

export function initFirebaseAdmin() {
  if (app) {
    return app;
  }

  // This should work because next.config.js is supposed to populate process.env
  const hasEnvCredentials = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  if (hasEnvCredentials) {
     const credentials = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        // Replace escaped newlines from environment variable
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };
    try {
        app = admin.initializeApp({
            credential: admin.credential.cert(credentials),
        });
        return app;
    } catch (error: any) {
        // If the app is already initialized, which can happen in some serverless environments,
        // just get the existing instance.
        if (error.code === 'duplicate-app') {
            app = admin.app();
            return app;
        }
        console.error('Firebase admin initialization error with creds', error);
        throw error;
    }
  }

  // Fallback for local development or emulators
  console.warn('Firebase Admin credentials not found in environment variables. Attempting to initialize with default credentials.');
  try {
     app = admin.initializeApp();
     return app;
  } catch (e: any) {
    if (e.code === 'duplicate-app') {
        app = admin.app();
        return app;
    }
    console.error("Default Firebase admin initialization failed.", e);
    throw e;
  }
}
