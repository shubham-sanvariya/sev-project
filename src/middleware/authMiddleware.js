import jwt from 'jsonwebtoken';
import {sendResponse} from "../utils/sendResponse.js";
import {HttpStatusCode} from "axios";

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return sendResponse(res,HttpStatusCode.Unauthorized,null,'Token expired, Please login again')
            }
            return sendResponse(res,HttpStatusCode.Forbidden,null,'Invalid token')
        }

        // // Check user existence
        // if (!decoded.isActive) {
        //     return res.status(403).json({ error: 'User inactive' });
        // }

        req.user = decoded; // already has id, role, etc.
        next();
    });
};

export const optionalAuthToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1️⃣ No token → true guest
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, ... }
        return next();
    } catch (err) {
        // 2️⃣ Token exists but invalid/expired → NOT a guest
        return sendResponse(res,HttpStatusCode.Unauthorized,null,"Session expired. Please login again.")
    }
};
