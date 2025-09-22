
import * as admin from 'firebase-admin';
import { getApps, initializeApp, getApp, cert } from 'firebase-admin/app';

/**
 * Initializes the Firebase Admin SDK, ensuring that it's a singleton.
 *
 * This function is idempotent. If the app is already initialized, it returns
 * the existing app instance. Otherwise, it initializes the app using
 * service account credentials from environment variables.
 *
 * @returns {admin.app.App} The initialized Firebase app instance.
 */
export function initFirebaseAdmin(): admin.app.App {
  if (getApps().length) {
    return getApp();
  }

  // Construct the credential object from environment variables
  const serviceAccount = {
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Check if the required environment variables are set
  if (!serviceAccount.projectId || !service-account.clientEmail || !service-account.privateKey) {
    console.error("Firebase Admin SDK: Missing service account environment variables.");
    // This will cause subsequent Firebase calls to fail, which is intended.
    // We return a dummy app object to avoid crashing the server immediately.
    // The errors will appear where Firebase services are used.
    return {} as admin.app.App;
  }

  console.log("Initializing Firebase Admin SDK with service account credentials...");
  try {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin SDK Initialization Error:", error);
    return {} as admin.app.App;
  }
}
