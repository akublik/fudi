
import * as admin from 'firebase-admin';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';

// This is a global cache for the initialized Firebase app instance.
let app: admin.app.App | undefined;

export function initFirebaseAdmin(): admin.app.App {
  if (app) {
    return app;
  }

  // Check if any apps are already initialized (e.g., in a serverless environment).
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }
  
  try {
    // Use application default credentials which are automatically available
    // in the App Hosting environment.
    app = initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    return app;
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
    // If it fails for any other reason, we rethrow to make the problem visible.
    throw error;
  }
}
