
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const cartSchema = z.object({
    productId: z
        .string()
        .regex(objectIdRegex),

    quantity: z
        .number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .default(1),

    selectedWeight: z.object({
        value: z
            .number()
            .positive('Weight value must be greater than 0'),
        unit: z.enum(['gm', 'kg'])
    })
});
