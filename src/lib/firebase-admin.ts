
'use server';

import * as admin from 'firebase-admin';
import { serviceAccount } from './server-credentials';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';

function initializeAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

    const credentials = {
        projectId: serviceAccount.projectId!,
        clientEmail: serviceAccount.clientEmail!,
        privateKey: serviceAccount.privateKey.replace(/\\n/g, '\n'),
    };

    try {
        return initializeApp({
            credential: admin.credential.cert(credentials),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
        throw error;
    }
}

export const app = initializeAdmin();
