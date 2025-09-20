
import * as admin from 'firebase-admin';

// Re-implement a singleton pattern for Firebase Admin initialization.
let app: admin.app.App | undefined;

export function initFirebaseAdmin() {
  if (app) {
    return app;
  }
  
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }

  // Verify that the required environment variables are set.
  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    const errorMessage = 'Firebase Admin credentials are not configured. Please check your environment variables.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return app;
  } catch (error: any) {
    // If the app is already initialized, which can happen in serverless environments,
    // we just get the existing instance.
    if (error.code === 'duplicate-app') {
      app = admin.app();
      return app;
    }
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}
