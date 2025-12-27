import Product from "../model/Product.js";
import {sendResponse} from "../utils/sendResponse.js";
import {HttpStatusCode} from "axios";
import {productSchema} from "../validators/productSchema.js";
import {ResponseType} from "../enum/ReqMessage.js";
import cloudinary from "../config/cloudinary.js";

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

    payload.name = handleNameUpdate(payload?.name, oldProduct.name,id,res);

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

export const getAllProducts = async (req,res) => {
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

    const files = req.files.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
    }));

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

const uploadFromBuffer = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "image" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

const imageUploader = async (name, reqFiles) => {
    const results = await Promise.all(reqFiles.map(file => uploadFromBuffer(file.buffer)));
    return results.map(img => ({
        url: img.secure_url,
        alt: name ?? ""
    }));
};

const getProductById = async (id,res) => {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
        return sendResponse(res, HttpStatusCode.NotFound, "Product not found", ResponseType.FAILED);
    }

    return existingProduct;
}

const validateProductId = async (id,res) => {
    // Validate ID presence and format
    if (!id) {
        return sendResponse(res, HttpStatusCode.BadRequest, "Product ID is required", ResponseType.FAILED);
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return sendResponse(res, HttpStatusCode.BadRequest, "Invalid product ID format", ResponseType.FAILED);
    }

}

function getNormalizedName (productName){
    return productName.charAt(0).toUpperCase() + productName.slice(1).toLowerCase();
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
