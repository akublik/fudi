
import * as admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

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

  // Check if the required environment variables are set
  if (!process.env.PROJECT_ID || !process.env.CLIENT_EMAIL || !process.env.PRIVATE_KEY) {
    console.error("Firebase Admin SDK: Faltan las variables de entorno de la cuenta de servicio (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY).");
    // Return a dummy app object to avoid crashing the server immediately.
    // The errors will appear where Firebase services are used.
    return {} as admin.app.App;
  }

  console.log("Inicializando Firebase Admin SDK con credenciales de la cuenta de servicio...");
  try {
    return initializeApp({
      // The credential is created directly from the environment variables.
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        // The private key needs to have its newlines restored.
        privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
  } catch (error) {
    console.error("Error en la inicialización de Firebase Admin SDK:", error);
    return {} as admin.app.App;
  }
}
