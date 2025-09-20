
'use server';

import * as admin from 'firebase-admin';
import { serviceAccount } from './server-credentials';
import { getApps } from 'firebase-admin/app';

let app: admin.app.App | undefined;

export async function initFirebaseAdmin() {
  if (app) {
    return app;
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
     if (getApps().length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      app = admin.app();
    }
    return app;
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}
