import { z } from 'zod';
import { PASSWORD_MAX } from '../../shared/constants/auth.constants.js';
import { phoneField } from './auth-fields.js';

export const loginSchema = z.object({
  phone: phoneField,
  password: z
    .string()
    .min(1, 'passwordEmpty')
    .max(PASSWORD_MAX, 'passwordLong'),
});

export type LoginDto = z.infer<typeof loginSchema>;
