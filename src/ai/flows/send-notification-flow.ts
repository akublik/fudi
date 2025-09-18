
'use server';

/**
 * @fileOverview A flow to send push notifications to users subscribed to a topic.
 * 
 * - sendNotification - A function that sends a notification to a topic.
 * - SendNotificationInput - The input type for the sendNotification function.
 * - SendNotificationOutput - The return type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMessaging } from 'firebase-admin/messaging';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

export const SendNotificationInputSchema = z.object({
  title: z.string().min(1, 'El título es requerido.'),
  body: z.string().min(1, 'El cuerpo del mensaje es requerido.'),
  topic: z.string().default('all_users'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export const SendNotificationOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;


export async function sendNotification(
  input: SendNotificationInput
): Promise<SendNotificationOutput> {
  return sendNotificationFlow(input);
}


const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: SendNotificationOutputSchema,
  },
  async ({ title, body, topic }) => {
    try {
      initFirebaseAdmin();

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

      const messageId = await getMessaging().send(message);

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
