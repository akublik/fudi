
'use server';

import * as admin from 'firebase-admin';
import { serviceAccount } from './server-credentials';
import { getApps, getApp } from 'firebase-admin/app';

export async function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
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
