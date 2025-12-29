import Product from "../model/Product.js";
import {sendResponse} from "../utils/sendResponse.js";
import {HttpStatusCode} from "axios";
import {productSchema} from "../validators/productSchema.js";
import {ResponseType} from "../enum/ReqMessage.js";
import {
    getImagesFromFiles,
    getNormalizedName,
    imageUploader,
    validateProductId
} from "../functions/ProductFun.js";

export const updateProductImages = async (req, res) => {
    const { id } = req.params;
    await validateProductId(id,res);

    const files = getImagesFromFiles(req.files);

    if (!files || files.length === 0) {
        return sendResponse(res, 400, "No images uploaded", ResponseType.FAILED);
    }

    // Fetch product
    const oldProduct = await getProductById(id,res);

    // Check existing + new count
    const existingCount = oldProduct.images?.length || 0;
    const newCount = files.length;
    const totalCount = existingCount + newCount;

    if (totalCount > 5) {
        return sendResponse(
            res,
            400,
            `Image limit exceeded. Current: ${existingCount}, New: ${newCount}, Max allowed: 5`,
            ResponseType.FAILED
        );
    }

    // Upload new images (e.g., Cloudinary)
    const newImages = await imageUploader(oldProduct.name, files);

// Spread operator ensures each object is added separately
    oldProduct.images.push(...newImages);
    oldProduct.updatedAt = new Date();
    await oldProduct.save();

    return sendResponse(
        res,
        200,
        { message: "Images updated successfully", oldProduct },
        ResponseType.SUCCESS
    );
};

export const updateProduct = async (req,res) => {
    const { id } = req.params;

    await validateProductId(id,res);

    const oldProduct = await getProductById(id,res);

    const payload = productSchema.partial().parse(req.body);

    if (Object.keys(payload).length === 0) {
        return sendResponse(
            res,
            HttpStatusCode.BadRequest,
            "No fields provided for update",
            ResponseType.FAILED
        );
    }

    payload.name = await handleNameUpdate(payload?.name, oldProduct.name,id,res);

    // Add update timestamp
    payload.updatedAt = new Date();

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true
        }
    ).lean();

    return sendResponse(
        res,
        HttpStatusCode.Ok,
        {
            message: "Product updated successfully",
            product: updatedProduct
        },
        ResponseType.SUCCESS
    );
}

export const getAllProducts = async (_,res) => {
    const products = await Product.find();

    return sendResponse(
        res,
        HttpStatusCode.Ok,
        products,
        'Products fetched successfully'
    )
}

export const addProduct = async (req,res) => {
    const payload = JSON.parse(req.body.payload);

    const files = getImagesFromFiles(req.files)

    const currProduct = productSchema.parse({
        ...payload,
        images: files, // now matches schema
    });

    const normalizedName = getNormalizedName(currProduct.name)

    const productExists = await Product.findOne({ name: normalizedName });

    if (productExists){
        return sendResponse(res, HttpStatusCode.Conflict, "Product Name already exits",ResponseType.FAILED);
    }

    const images = await imageUploader(currProduct.name, req.files);

    const createProduct = new Product({
        ...currProduct,
        name: normalizedName,
        images
    });

    const savedProduct = await createProduct.save();

    return sendResponse(res, HttpStatusCode.Created, savedProduct.toObject(), ResponseType.SUCCESS );
}

const  handleNameUpdate = async (productName, oldProductName,id,res) => {
    if (productName && productName !== oldProductName) {
        const normalizedName = getNormalizedName(productName);

        const nameExists = await Product.findOne({
            name: normalizedName,
            _id: { $ne: id }
        });

        if (nameExists) {
            return sendResponse(
                res,
                HttpStatusCode.Conflict,
                "Product name already exists",
                ResponseType.FAILED
            );
        }

        // validatedData.name = normalizedName;
        return normalizedName;
    }
}

export const getProductById = async (id,res) => {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
        return sendResponse(res, HttpStatusCode.NotFound, "Product not found", ResponseType.FAILED);
    }

    return existingProduct;
}
