
import * as admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

/**
 * Initializes the Firebase Admin SDK, ensuring that it's a singleton.
 *
 * This function is idempotent. If the app is already initialized, it returns
 * the existing app instance. Otherwise, it initializes the app using
 * Application Default Credentials, which are automatically available in
 * Firebase and other Google Cloud environments.
 *
 * @returns {admin.app.App} The initialized Firebase app instance.
 */
export function initFirebaseAdmin(): admin.app.App {
  // getApps() returns a list of all initialized apps.
  // If the list is not empty, it means the SDK has already been initialized.
  if (getApps().length) {
    // getApp() retrieves the default app instance.
    return getApp();
  }

  // If no app is initialized, create a new one.
  // When no credentials are provided, the SDK uses Application Default Credentials.
  console.log("Initializing Firebase Admin SDK for the first time...");
  return initializeApp();
}
