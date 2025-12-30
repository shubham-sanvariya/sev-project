
import express from "express";
import {addProduct, getAllProducts, updateProduct, updateProductImages} from "../controller/productController.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.get('/products', asyncHandler(getAllProducts))

router.post("/products", upload.array("images",5) ,asyncHandler(addProduct))

router.patch('/products/:id', asyncHandler(updateProduct))

router.patch(
    '/products/:id/images',
    upload.array('images', 5), // per-request limit
    asyncHandler(updateProductImages)
);

export default router
