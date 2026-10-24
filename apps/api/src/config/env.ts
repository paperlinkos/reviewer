import { z } from 'zod';
const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  LOCAL_MEDIA_DIR: z.string().trim().min(1).default('/tmp/visual-feedback-media'),
  LOCAL_MEDIA_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().max(100 * 1024 * 1024).default(25 * 1024 * 1024),
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().min(1).optional(),
});
const schema = baseSchema.superRefine((value, context) => {
  if (value.STORAGE_PROVIDER === 's3' && (!value.S3_ENDPOINT || !value.S3_BUCKET)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'S3_ENDPOINT and S3_BUCKET are required when STORAGE_PROVIDER=s3', path: ['STORAGE_PROVIDER'] });
});
export type Env = z.infer<typeof schema>;
export function validateEnv(config: Record<string, unknown>): Env { const result = schema.safeParse(config); if (!result.success) throw new Error(`Invalid environment configuration: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`); return result.data; }
