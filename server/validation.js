import { z } from 'zod';

export const encounterSchema = z.object({
  type: z.enum(['Assessment', 'Follow-up', 'Admission', 'Discharge']),
  diagnosis: z.string().trim().min(1).max(200),
  notes: z.string().trim().min(1).max(5000),
  author: z.string().trim().max(120).optional(),
});

export const requisitionSchema = z.object({
  item: z.string().trim().min(1).max(200),
  qty: z.number().int().positive(),
});

export const queueItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
}).passthrough();

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(', '));
    error.status = 400;
    throw error;
  }
  return result.data;
}
