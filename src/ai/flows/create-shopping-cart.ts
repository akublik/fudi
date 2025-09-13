
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


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
    console.log('Simulating shopping cart creation with input:', input);

    const trackingId = `FUDI-${crypto.randomUUID()}`;
    const mockCheckoutUrl = `https://supermercado-ejemplo.com/cart/${trackingId}?affiliate=fudichef`;
    
    // If a user ID is provided, save the transaction to their purchase history.
    if (input.userId) {
      try {
        const historyRef = collection(db, 'purchaseHistory');
        await addDoc(historyRef, {
          userId: input.userId,
          store: input.store,
          items: input.items,
          trackingId: trackingId,
          checkoutUrl: mockCheckoutUrl,
          purchaseDate: serverTimestamp(), // Use server timestamp for consistency
        });
         console.log(`Purchase history saved for user ${input.userId}`);
      } catch (error) {
        console.error("Failed to save purchase history to Firestore", error);
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
