import Product from "../model/Product.js";
import {sendResponse} from "../utils/sendResponse.js";
import {HttpStatusCode} from "axios";
import {productSchema} from "../validators/productSchema.js";
import {ResponseType} from "../enum/ReqMessage.js";
import cloudinary from "../config/cloudinary.js";


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


    const normalizedName = currProduct.name.charAt(0).toUpperCase() + currProduct.name.slice(1).toLowerCase();

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
