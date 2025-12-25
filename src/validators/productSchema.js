import { z } from "zod";

const imagesSchema = z
    .array(
        z.object({
            originalname: z.string(),
            mimetype: z.string().regex(/^image\/(jpeg|png|jpg)$/),
            buffer: z.instanceof(Buffer), // memoryStorage gives you Buffer
        })
    )
    .min(1, "At least 1 image file is required")
    .max(5, "You can upload up to 5 image files");



export const productSchema = z.object({
    name: z.string()
        .min(3)
        .max(100)
        .transform(val => val.trim().replace(/\s+/g, ' ')), // normalize

    description: z.string()
        .min(50)
        .max(500)
        .transform(val => val.trim().replace(/\s+/g, ' ')),

    weight: z.array(z.object({
        value: z.number().positive(),
        unit: z.enum(['g', 'kg'])
    })).min(1),

    price: z.number().min(10),
    discountedPrice: z.number().min(0).optional(),

    category: z.enum([
        'Namkeen', 'Sweets', 'Chips', 'Biscuits',
        'Spices', 'Pickles', 'Ready-to-eat', 'Health'
    ]),

    ingredients: z.string()
        .min(5)
        .transform(val => val.trim().replace(/\s+/g, ' ')),

    images: imagesSchema,
    stock: z.number().int().nonnegative().default(0),
    isVegetarian: z.boolean().default(true),

    tags: z.array(z.string()
        .transform(val => val.trim().replace(/\s+/g, ' '))
    ).optional(),

    rating: z.object({
        average: z.number().min(0).max(5).default(0),
        count: z.number().int().nonnegative().default(0)
    }).optional()
});
