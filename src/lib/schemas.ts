
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


export const SubscribeToTopicInputSchema = z.object({
  token: z.string().min(1, 'El token es requerido.'),
  topic: z.string().min(1, 'El tópico es requerido.'),
});
export type SubscribeToTopicInput = z.infer<typeof SubscribeToTopicInputSchema>;


export const SubscribeToTopicOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SubscribeToTopicOutput = z.infer<typeof SubscribeToTopicOutputSchema>;
