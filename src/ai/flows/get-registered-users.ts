
'use server';

/**
 * @fileOverview A Genkit flow to securely fetch all registered users and their preferences.
 * 
 * - getRegisteredUsersFlow - A function that returns a list of all users.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { UserPreferences } from '@/lib/types';


// Define the output schema for a single user
const RegisteredUserSchema = z.object({
  uid: z.string(),
  displayName: z.string().optional(),
  email: z.string().optional(),
  photoURL: z.string().optional(),
  preferences: z.object({
    restrictions: z.array(z.string()).optional(),
    cuisines: z.array(z.string()).optional(),
    otherCuisines: z.string().optional(),
    totalPoints: z.number().optional(),
  }),
});

// Define the output schema for the flow
const GetRegisteredUsersOutputSchema = z.array(RegisteredUserSchema);

export type RegisteredUser = z.infer<typeof RegisteredUserSchema>;


export const getRegisteredUsersFlow = ai.defineFlow(
  {
    name: 'getRegisteredUsersFlow',
    inputSchema: z.void(),
    outputSchema: GetRegisteredUsersOutputSchema,
  },
  async () => {
    try {
      const app = initFirebaseAdmin();
      const auth = getAuth(app);
      const db = getFirestore(app);

      const listUsersResult = await auth.listUsers();
      const allUsers = listUsersResult.users;

      const preferencesDocs = await db.collection('userPreferences').get();
      const preferencesMap = new Map<string, UserPreferences>();
      preferencesDocs.forEach(doc => {
        preferencesMap.set(doc.id, doc.data() as UserPreferences);
      });

      const registeredUsers: RegisteredUser[] = allUsers.map(userRecord => {
        const preferences = preferencesMap.get(userRecord.uid) || {
          restrictions: [],
          cuisines: [],
          otherCuisines: '',
          totalPoints: 0,
        };
        return {
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          email: userRecord.email,
          photoURL: userRecord.photoURL,
          preferences: preferences,
        };
      });
      
      return registeredUsers;

    } catch (error) {
      console.error("Error fetching registered users within Genkit flow:", error);
      throw new Error('Failed to fetch registered users. Check server logs.');
    }
  }
);
