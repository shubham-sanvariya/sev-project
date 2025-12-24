
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minLength: [3, 'Product name must be least 3 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minLength: [50, 'Product description must be least 100 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    weight: {
        type: [{
            value: Number,
            unit: { type: String, default: 'g', enum: ['g', 'kg'] }
        }],
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'At least one weight option is required'
        }
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [10, 'Price must be a positive number']
    },
    discountedPrice: {
        type: Number,
        min: [0, 'Discounted price must be positive']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Namkeen', 'Sweets', 'Chips', 'Biscuits', 'Spices', 'Pickles', 'Ready-to-eat', 'Health']
    },
    ingredients: {
        type: String,
        required: [true, 'Ingredients list is required']
    },
    images: [{
        url: { type: String, required: true }, // Cloudinary URL
        alt: { type: String, required: true }  // accessibility text
    }],

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    isVegetarian: {
        type: Boolean,
        default: true
    },
    tags: [String],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
},{
    timestamps: true
})

productSchema.index({ name: "text", description: "text", category: 1, price: 1 })

productSchema.pre('save', async function () {
    // Normalize all string fields
    for (const path in this.schema.paths) {
        const field = this[path];
        if (typeof field === 'string') {
            this[path] = field.trim().replace(/\s+/g, ' ');
        }
    }

    // Normalize arrays of strings (tags)
    if (Array.isArray(this.tags)) {
        this.tags = this.tags.map(tag =>
            typeof tag === 'string' ? tag.trim().replace(/\s+/g, ' ') : tag
        );
    }

    // Normalize nested objects (images)
    if (Array.isArray(this.images)) {
        this.images = this.images.map(img => ({
            ...img,
            url: typeof img.url === 'string' ? img.url.trim().replace(/\s+/g, ' ') : img.url,
            alt: typeof img.alt === 'string' ? img.alt.trim().replace(/\s+/g, ' ') : img.alt,
        }));
    }
});


export default mongoose.model("Product", productSchema)
