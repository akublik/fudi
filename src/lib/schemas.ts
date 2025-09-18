
import { z } from 'zod';

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
