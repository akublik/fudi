
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
  // This is a critical security check.
  const projectId = process.env.PROJECT_ID;
  const clientEmail = process.env.CLIENT_EMAIL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      'ERROR CRÍTICO: Faltan las variables de entorno de la cuenta de servicio (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY) en su archivo .env. La aplicación no puede inicializar el SDK de administración. Por favor, configure estas variables para continuar.'
    );
    // Throw an error to stop execution and make the problem obvious.
    throw new Error('Missing Firebase Admin SDK credentials. Check your .env file and server logs.');
  }

  console.log(
    'Inicializando Firebase Admin SDK con credenciales de la cuenta de servicio...'
  );
  try {
    const serviceAccount: admin.ServiceAccount = {
      projectId: projectId,
      clientEmail: clientEmail,
      // The private key needs to have its newlines restored.
      // The value from .env is a string literal, so we replace '\\n' with '\n'.
      privateKey: privateKey.replace(/\\n/g, '\n'),
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
