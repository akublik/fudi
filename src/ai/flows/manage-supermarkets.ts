
'use server';

/**
 * @fileOverview A set of flows for managing supermarkets in the Firestore database.
 * 
 * - getSupermarketsFlow - Fetches all supermarkets.
 * - addSupermarketFlow - Adds a new supermarket.
 * - deleteSupermarketFlow - Deletes a supermarket by its ID.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, GeoPoint } from 'firebase/firestore';
import { AddSupermarketInputSchema, SupermarketSchema, type Supermarket } from '@/lib/types';


export const getSupermarketsFlow = ai.defineFlow(
  {
    name: 'getSupermarketsFlow',
    inputSchema: z.void(),
    outputSchema: z.array(SupermarketSchema),
  },
  async () => {
    console.log('Fetching all supermarkets...');
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

      console.log(`Found ${allStores.length} supermarkets.`);
      return allStores;
    } catch (error) {
      console.error("Error fetching supermarkets:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
      }
      throw new Error('Failed to fetch supermarkets.');
    }
  }
);


export const addSupermarketFlow = ai.defineFlow(
  {
    name: 'addSupermarketFlow',
    inputSchema: AddSupermarketInputSchema,
    outputSchema: SupermarketSchema,
  },
  async (input) => {
    console.log(`Adding new supermarket: ${input.name}`);
    try {
      const supermarketsRef = collection(db, 'supermarkets');
      const docRef = await addDoc(supermarketsRef, {
        name: input.name,
        logoUrl: input.logoUrl,
        location: new GeoPoint(input.latitude, input.longitude),
      });

      const newSupermarket: Supermarket = {
        id: docRef.id,
        name: input.name,
        logoUrl: input.logoUrl,
        location: {
            latitude: input.latitude,
            longitude: input.longitude
        }
      };

      console.log(`Successfully added supermarket with ID: ${docRef.id}`);
      return newSupermarket;

    } catch (error) {
        console.error("Error adding supermarket:", error);
        throw new Error('Failed to add new supermarket.');
    }
  }
);


export const deleteSupermarketFlow = ai.defineFlow(
  {
    name: 'deleteSupermarketFlow',
    inputSchema: z.string().describe('The ID of the supermarket to delete.'),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (id) => {
    console.log(`Attempting to delete supermarket with ID: ${id}`);
    try {
        if (!id) {
            throw new Error("Supermarket ID is required for deletion.");
        }
        const supermarketDocRef = doc(db, 'supermarkets', id);
        await deleteDoc(supermarketDocRef);
        
        console.log(`Successfully deleted supermarket with ID: ${id}`);
        return { success: true };
    } catch (error) {
        console.error(`Error deleting supermarket with ID ${id}:`, error);
        throw new Error('Failed to delete supermarket.');
    }
  }
);


