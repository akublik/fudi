

import * as admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';

/**
 * Initializes the Firebase Admin SDK, ensuring that it's a singleton.
 *
 * This function is idempotent. If the app is already initialized, it returns
 * the existing app instance. Otherwise, it initializes the app using
 * service account credentials from environment variables.
 *
 * @returns {admin.app.App} The initialized Firebase app instance.
 */
export function initFirebaseAdmin(): App {
  // If the app is already initialized, return the existing instance.
  if (getApps().length) {
    return getApp();
  }

  // Check if the required environment variables are set.
  if (
    !process.env.PROJECT_ID ||
    !process.env.CLIENT_EMAIL ||
    !process.env.PRIVATE_KEY
  ) {
    console.error(
      'Firebase Admin SDK: Faltan las variables de entorno de la cuenta de servicio (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY).'
    );
    // Throw an error to make it clear that initialization failed.
    throw new Error('Missing Firebase Admin SDK credentials in .env file.');
  }

  console.log(
    'Inicializando Firebase Admin SDK con credenciales de la cuenta de servicio...'
  );
  try {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      // The private key needs to have its newlines restored.
      // The value from .env is a string literal, so we replace '\\n' with '\n'.
      privateKey: (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error en la inicialización de Firebase Admin SDK:', error);
    // Re-throw the error to ensure consuming code knows about the failure.
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}
