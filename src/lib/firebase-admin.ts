
import * as admin from 'firebase-admin';

export function initFirebaseAdmin() {
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
