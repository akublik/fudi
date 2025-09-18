
'use server';

/**
 * @fileOverview A flow to send push notifications to users subscribed to a topic.
 * 
 * - sendNotificationFlow - A function that sends a notification to a topic.
 */

import { ai } from '@/ai/genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { SendNotificationInputSchema, SendNotificationOutputSchema, type SendNotificationInput, type SendNotificationOutput } from '@/lib/schemas';


export const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ title, body, topic }) => {
    try {
      const app = initFirebaseAdmin();

      const message = {
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            icon: 'https://www.fudichef.com/icon.png',
          },
          fcmOptions: {
            link: 'https://www.fudichef.com',
          },
        },
        topic: topic,
      };

      const messageId = await getMessaging(app).send(message);

      console.log('Successfully sent message:', messageId);
      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message || 'An unknown error occurred.',
      };
    }
  }
);
