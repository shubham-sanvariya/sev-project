import {cartSchema} from "../dto/cartReq.js";
import {sendResponse} from "../utils/sendResponse.js";
import Product from "../model/Product.js";
import Cart from "../model/Cart.js";
import {HttpStatusCode} from "axios";


export const addToCart = async (req,res) => {
    const { productId, quantity, selectedWeight } =
        cartSchema.parse(req.body);

    const product = await Product.findById(productId);
    if (!product) {
        return sendResponse(res, 404, null, 'Product not found');
    }

    const cart = await Cart.findOne({ user: req.user.id })
        || await Cart.create({ user: req.user.id });

    const existingItem = cart.items.find(
        item =>
            item.product.toString() === productId &&
            item.selectedWeight.value === selectedWeight.value &&
            item.selectedWeight.unit === selectedWeight.unit
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product: product._id,
            quantity,
            selectedWeight,
            price: product.price
        });
    }

    const {totalItems,totalPrice} = calculateCartItems(cart.items);

    cart.totalItems = totalItems;

    cart.totalPrice = totalPrice;

    await cart.save();

    return sendResponse(res, 200, cart, 'Product added to cart');
}

export const removeFromCart = async (req, res) => {
    const { productId, selectedWeight } =
        cartSchema.pick({productId: true, selectedWeight: true}).parse(req.body);

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
        return sendResponse(res, HttpStatusCode.NotFound, null, 'Cart is empty');
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(item =>
        !(
            item.product.toString() === productId &&
            item.selectedWeight.value === selectedWeight.value &&
            item.selectedWeight.unit === selectedWeight.unit
        )
    );

    if (cart.items.length === initialLength) {
        return sendResponse(res, HttpStatusCode.NotFound, null, 'Item not found in cart');
    }

    // 🔄 Recalculate totals

    const {totalItems,totalPrice} = calculateCartItems(cart.items);
    cart.totalItems = totalItems;

    cart.totalPrice = totalPrice;

    await cart.save();

    return sendResponse(res, HttpStatusCode.Ok, cart, 'Item removed from cart');
};

function calculateCartItems(items){

    const totalItems = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );

    return {totalItems,totalPrice};
}
