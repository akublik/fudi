
'use server';

/**
 * @fileOverview A flow to handle contact form submissions and save them to Firestore
 * to be sent as an email by the "Trigger Email" Firebase Extension.
 *
 * - sendContactMessage - Saves the contact message to the 'mail' collection.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const ContactMessageInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

export const sendContactMessageFlow = ai.defineFlow(
  {
    name: 'sendContactMessageFlow',
    inputSchema: ContactMessageInputSchema,
    outputSchema: z.object({ success: z.boolean(), messageId: z.string() }),
  },
  async (input) => {
    try {
      console.log('Saving contact message to Firestore:', input.subject);
      const db = getFirestore(initFirebaseAdmin());
      // The user has configured the extension to listen to this collection name.
      const mailRef = db.collection('info@fudichef.com');

      const emailDocument = {
        to: ['info@fudichef.com'],
        from: 'FudiChef Contacto <info@fudichef.com>',
        message: {
          subject: `[FudiChef Contacto] ${input.subject}`,
          html: `
            <p><strong>Nombre:</strong> ${input.name}</p>
            <p><strong>Correo:</strong> ${input.email}</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p>${input.message.replace(/\n/g, '<br>')}</p>
          `,
        },
      };

      const docRef = await mailRef.add(emailDocument);
      console.log(`Message saved with ID: ${docRef.id}`);

      return { success: true, messageId: docRef.id };
    } catch (error) {
      console.error('Error saving contact message to Firestore:', error);
      throw new Error('Failed to save contact message.');
    }
  }
);
