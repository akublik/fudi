
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
      console.log('Sending email via Resend with subject:', input.subject);
      
      const { data, error } = await resend.emails.send({
        from: 'FudiChef Contacto <info@fudichef.com>',
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
        console.error('Error sending email from Resend:', error);
        throw new Error(error.message);
      }
      
      console.log(`Email sent successfully with ID: ${data?.id}`);
      return { success: true, messageId: data?.id };

    } catch (error) {
      console.error('Error in sendContactMessageFlow:', error);
      throw new Error('Failed to send contact message.');
    }
  }
);
