
'use server';

/**
 * @fileOverview A flow to find nearby supermarkets based on user's location.
 *
 * - findNearbyStoresFlow - A function that returns a list of all supermarkets.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import { SupermarketSchema, type Supermarket, FindNearbyStoresOutputSchema } from '@/lib/types';


export const findNearbyStoresFlow = ai.defineFlow(
  {
    name: 'findNearbyStoresFlow',
    inputSchema: z.void(), // No input needed anymore
    outputSchema: FindNearbyStoresOutputSchema,
  },
  async () => {
    console.log('Fetching all stores from Firestore...');
    try {
      const db = getFirestore(initFirebaseAdmin());
      const supermarketsRef = db.collection('supermarkets');
      const querySnapshot = await supermarketsRef.get();
      
      const allStores: Supermarket[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const location = data.location as GeoPoint;
        return SupermarketSchema.parse({
            id: doc.id,
            name: data.name,
            logoUrl: data.logoUrl,
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
            }
        });
      });

      console.log(`Found ${allStores.length} total stores.`);
      return {
        stores: allStores,
      };

    } catch (error) {
      console.error("Error fetching stores:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
      }
      throw new Error('Failed to fetch stores. Check server logs.');
    }
  }
);
