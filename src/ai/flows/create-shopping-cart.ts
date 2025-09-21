
'use server';

/**
 * @fileOverview A flow that simulates creating a shopping cart and saves the transaction to purchase history.
 * This is a placeholder for a real integration.
 *
 * - createShoppingCart - The main function that orchestrates the cart creation simulation and history logging.
 */

import {ai} from '@/ai/genkit';
import { ShoppingCartInputSchema, ShoppingCartOutputSchema, type ShoppingCartInput, type ShoppingCartOutput, PurchaseHistoryItemSchema } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';


export async function createShoppingCart(
  input: ShoppingCartInput
): Promise<ShoppingCartOutput> {
  return createShoppingCartFlow(input);
}


const createShoppingCartFlow = ai.defineFlow(
  {
    name: 'createShoppingCartFlow',
    inputSchema: ShoppingCartInputSchema,
    outputSchema: ShoppingCartOutputSchema,
  },
  async (input) => {
    console.log('Simulating shopping cart creation for store:', input.store);

    const trackingId = `FUDI-${crypto.randomUUID()}`;
    const mockCheckoutUrl = `https://supermercado-ejemplo.com/cart/${trackingId}?affiliate=fudichef`;
    
    // Calculate total cost and points
    const totalCost = input.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const pointsEarned = Math.floor(totalCost); // 1 point per dollar
    
    // If a user ID is provided, save the transaction to their purchase history.
    if (input.userId) {
      try {
        const userRef = doc(db, 'userPreferences', input.userId);
        const historyRef = collection(db, 'purchaseHistory');

        // Use a transaction to ensure points are updated atomically
        await runTransaction(db, async (transaction) => {
           // 1. Add the new purchase to the history
           transaction.set(doc(historyRef), {
              userId: input.userId,
              store: input.store,
              items: input.items,
              trackingId: trackingId,
              checkoutUrl: mockCheckoutUrl,
              purchaseDate: serverTimestamp(),
              totalCost: totalCost,
              pointsEarned: pointsEarned,
           });

           // 2. Update the user's total points
           const userDoc = await transaction.get(userRef);
           const currentPoints = userDoc.data()?.totalPoints || 0;
           transaction.set(userRef, {
             totalPoints: currentPoints + pointsEarned
           }, { merge: true });
        });

        console.log(`Purchase history saved and points updated for user ${input.userId}`);
      } catch (error) {
        console.error("Failed to save purchase history or update points", error);
        // We don't re-throw the error, as the primary function (cart creation)
        // might have succeeded. We just log it.
      }
    }

    return {
      checkoutUrl: mockCheckoutUrl,
      trackingId: trackingId,
    };
  }
);
