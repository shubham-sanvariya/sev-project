
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minLength: [3, 'Product name must be least 3 characters'],
        maxlength: [100, 'Description cannot exceed 500 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minLength: [100, 'Product description must be least 100 characters'],
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
        url: String,
        alt: String
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
    isVegan: Boolean,
    tags: [String],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
},{
    timestamps: true
})

productSchema.index({ name: "text", description: "text", category: 1, price: 1 })

module.exports = mongoose.model("Product", productSchema)
