import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {addToCart, removeFromCart} from "../controller/cartController.js";

const router = express.Router();

router.post("/cart/add",asyncHandler(addToCart));

router.delete("/cart/remove",asyncHandler(removeFromCart));
