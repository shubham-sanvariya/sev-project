import {loginSchema} from "../dto/LoginReq.js";
import {signupSchema} from "../dto/signupReq.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import {sendResponse} from "../utils/sendResponse.js";


export const login = async (req,res) => {
    const { email, password } = loginSchema.parse(req.body);
}

export const signup = async (req,res) => {
    const { username, email, password,phone } = signupSchema.parse(req.body);

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // ✅ Build user object dynamically (skip phone if not provided)
    const userData = { username, email, password };
    if (phone) {
        userData.phone = phone;
    }

    // ✅ Create new user
    const newUser = await User.create(userData);


    // ✅ Generate Access Token (short-lived)
    const accessToken = generateAccessToken(newUser._id,newUser.role,res);

    // ✅ Generate Refresh Token (long-lived)
    const refreshToken = generateRefreshToken(newUser._id,res);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendResponse(res,201,newUser,"User registered successfully")
}

function generateAccessToken (id,role){
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes
    );
}

function generateRefreshToken(id){
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' } // 7 days
    );
}
