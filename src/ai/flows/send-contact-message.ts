
'use server';

/**
 * @fileOverview A flow to handle contact form submissions and send them as an email using Resend.
 *
 * - sendContactMessage - Sends the contact message via the Resend API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

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
    outputSchema: z.object({ success: z.boolean(), messageId: z.string().optional() }),
  },
  async (input) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Resend API key is not configured. Please set RESEND_API_KEY in your .env file.");
      throw new Error('El servidor de correo no está configurado.');
    }

    const resend = new Resend(resendApiKey);

    try {
      console.log('Attempting to send email via Resend with input:', input);
      
      const { data, error } = await resend.emails.send({
        from: 'FudiChef Onboarding <onboarding@resend.dev>',
        to: ['info@fudichef.com'],
        subject: `[FudiChef Contacto] ${input.subject}`,
        reply_to: input.email,
        html: `
            <p><strong>Nombre:</strong> ${input.name}</p>
            <p><strong>Correo:</strong> ${input.email}</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p>${input.message.replace(/\n/g, '<br>')}</p>
          `,
      });

      if (error) {
        console.error('Error response from Resend:', error);
        throw new Error(error.message);
      }
      
      console.log(`Email sent successfully via Resend with ID: ${data?.id}`);
      return { success: true, messageId: data?.id };

    } catch (error) {
      console.error('Failed to execute Resend logic in flow:', error);
      // Ensure any error is thrown to be caught by the action
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while sending the message.');
    }
  }
);
