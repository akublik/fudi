
import * as admin from 'firebase-admin';
import { serverCredentials } from './server-credentials';

// Re-implement a singleton pattern for Firebase Admin initialization.
let app: admin.app.App | undefined;

export function initFirebaseAdmin() {
  if (app) {
    return app;
  }
  
  // Verifica si las credenciales de marcador de posición han sido reemplazadas.
  if (
    serverCredentials.projectId === 'TU_FIREBASE_PROJECT_ID' ||
    !serverCredentials.projectId
  ) {
    const errorMessage = 'Las credenciales de Firebase Admin no están configuradas. Por favor, edita el archivo `src/lib/server-credentials.ts` con tus credenciales reales.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const credentials = {
    projectId: serverCredentials.projectId,
    clientEmail: serverCredentials.clientEmail,
    privateKey: serverCredentials.privateKey.replace(/\\n/g, '\n'),
  };

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    return app;
  } catch (error: any) {
    // Si la app ya está inicializada, lo cual puede pasar en entornos serverless,
    // simplemente obtenemos la instancia existente.
    if (error.code === 'duplicate-app') {
      app = admin.app();
      return app;
    }
    console.error('Error en la inicialización de Firebase Admin:', error);
    throw error;
  }
}
