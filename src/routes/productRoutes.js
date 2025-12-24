
import express from "express";
import {addProduct, getAllProducts} from "../controller/productController.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.get('/products', asyncHandler(getAllProducts))

router.post("/products", upload.array("images",5) ,asyncHandler(addProduct))

export default router
