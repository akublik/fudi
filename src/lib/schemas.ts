
'use server';
import { z } from 'zod';

export const SendNotificationInputSchema = z.object({
  title: z.string().min(1, 'El título es requerido.'),
  body: z.string().min(1, 'El cuerpo del mensaje es requerido.'),
  topic: z.string().default('all_users'),
});