import {sendResponse} from "../utils/sendResponse.js";


export const responseFormatter = (req, res, next) => {
    res.sendResponse = (statusCode, data, message) => sendResponse(res, statusCode, data, message);
    next();
};

