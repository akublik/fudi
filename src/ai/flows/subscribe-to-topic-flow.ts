
'use server';

/**
 * @fileOverview A flow to subscribe a device token to a push notification topic.
 * 
 * - subscribeToTopicFlow - A function that handles the subscription logic.
 */

import { ai } from '@/ai/genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { SubscribeToTopicInputSchema, SubscribeToTopicOutputSchema } from '@/lib/schemas';

export const subscribeToTopicFlow = ai.defineFlow(
  {
    name: 'subscribeToTopicFlow',
    inputSchema: SubscribeToTopicInputSchema,
    outputSchema: SubscribeToTopicOutputSchema,
  },
  async ({ token, topic }) => {
    try {
      const firebaseAdminApp = initFirebaseAdmin();
      const messaging = getMessaging(firebaseAdminApp);

      // Subscribe the device token to the topic
      const response = await messaging.subscribeToTopic([token], topic);
      
      if (response.errors.length > 0) {
        console.error('Errors subscribing to topic:', response.errors);
        throw new Error(response.errors.map(e => e.message).join(', '));
      }

      console.log('Successfully subscribed to topic:', response);
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Error subscribing to topic:', error);
      return {
        success: false,
        error: error.message || 'An unknown error occurred.',
      };
    }
  }
);
