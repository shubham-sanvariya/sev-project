import {sendResponse} from "../utils/sendResponse.js";
import {HttpStatusCode} from "axios";
import cloudinary from "../config/cloudinary.js";
import {ResponseType} from "../enum/ReqMessage.js";

export function getNormalizedName (productName){
    return productName.charAt(0).toUpperCase() + productName.slice(1).toLowerCase();
}

export function getImagesFromFiles(files){
    return files?.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
    }));
}

export const validateProductId = async (id,res) => {
    // Validate ID presence and format
    if (!id) {
        return sendResponse(res, HttpStatusCode.BadRequest, "Product ID is required", ResponseType.FAILED);
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return sendResponse(res, HttpStatusCode.BadRequest, "Invalid product ID format", ResponseType.FAILED);
    }

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

export const imageUploader = async (name, reqFiles) => {
    const results = await Promise.all(reqFiles.map(file => uploadFromBuffer(file.buffer)));
    return results.map(img => ({
        url: img.secure_url,
        alt: name ?? ""
    }));
};
