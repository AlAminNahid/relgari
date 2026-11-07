import { z } from 'zod';
import {
  NAME_MAX,
  NAME_MIN,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from '../../shared/constants/auth.constants.js';
import { nidField, phoneField } from './auth-fields.js';

export const registerSchema = z.object({
  name: z.string().trim().min(NAME_MIN, 'name').max(NAME_MAX, 'name'),
  phone: phoneField,
  nid: nidField,
  password: z
    .string()
    .min(PASSWORD_MIN, 'passwordShort')
    .max(PASSWORD_MAX, 'passwordLong'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
