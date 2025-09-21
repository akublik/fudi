
'use server';

/**
 * @fileOverview A flow to find nearby supermarkets based on user's location.
 *
 * - findNearbyStoresFlow - A function that returns a list of supermarkets within a specified radius.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, getDocs, GeoPoint } from 'firebase/firestore';
import { getDistance } from 'geolib';
import { FindNearbyStoresInputSchema, FindNearbyStoresOutputSchema, SupermarketSchema, type Supermarket } from '@/lib/types';


export const findNearbyStoresFlow = ai.defineFlow(
  {
    name: 'findNearbyStoresFlow',
    inputSchema: FindNearbyStoresInputSchema,
    outputSchema: FindNearbyStoresOutputSchema,
  },
  async ({ latitude, longitude, radius }) => {
    try {
      const supermarketsRef = collection(db, 'supermarkets');
      const querySnapshot = await getDocs(supermarketsRef);
      
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

      const nearbyStores = allStores
        .map(store => {
          const distance = getDistance(
            { latitude, longitude },
            { latitude: store.location.latitude, longitude: store.location.longitude }
          );
          // Convert distance from meters to kilometers
          const distanceInKm = distance / 1000;
          return { ...store, distance: distanceInKm };
        })
        .filter(store => store.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return {
        stores: nearbyStores,
      };

    } catch (error) {
      console.error("Error fetching nearby stores:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
      }
      throw new Error('Failed to fetch nearby stores. Check server logs.');
    }
  }
);
