'use server';

import * as admin from 'firebase-admin';
import { serviceAccount } from './server-credentials';
import { getApps, getApp } from 'firebase-admin/app';

export async function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
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
    const credentials = {
        projectId: serviceAccount.projectId!,
        clientEmail: serviceAccount.clientEmail!,
        privateKey: serviceAccount.privateKey.replace(/\\n/g, '\n'),
    };
    
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}
