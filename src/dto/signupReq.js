import { z } from 'zod';

export const signupSchema = z.object({
    email: z
        .email({ message: 'Please enter a valid email address' }),

    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters long' })
        .max(40, { message: 'Username must not exceed 40 characters' }),

    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
            {
                message:
                    'Password must contain at least 1 uppercase letter, 1 number, and 1 special character'
            }
        ),

    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid Indian mobile 10 digit number' })
        .optional()
});

