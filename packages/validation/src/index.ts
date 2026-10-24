import { z } from 'zod';
export const taskStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);
export const annotationGeometryV1Schema = z.object({ version: z.literal('v1'), kind: z.enum(['point', 'rectangle', 'arrow']), x: z.number().finite(), y: z.number().finite(), width: z.number().positive().optional(), height: z.number().positive().optional(), endX: z.number().finite().optional(), endY: z.number().finite().optional() });
export const originSchema = z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'Only HTTP(S) origins are allowed');
