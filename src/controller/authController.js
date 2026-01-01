import {loginSchema} from "../dto/LoginReq.js";
import {signupSchema} from "../dto/signupReq.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import {sendResponse} from "../utils/sendResponse.js";
import {sendVerificationEmail} from "../utils/emailservice.js";


export const login = async (req,res) => {
    const { email, password } = loginSchema.parse(req.body);

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
        return sendResponse(res,400,null,'Email is not registered');
    }

    if (!existingUser.isEmailVerified) {
        return res.status(403).json({
            message: 'Please verify your email first'
        });
    }

}

export const signup = async (req,res) => {
    const userData = signupSchema.parse(req.body);
    // ✅ Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
        return sendResponse(res,400,null,'Email already registered');
    }

    const { token, hashedToken } = generateEmailVerifyToken();

    // ✅ Build user object dynamically (skip phone if not provided)
    const newUser = await User.create({
        ...userData,
        emailVerifyToken: hashedToken,
        emailVerifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000 // 24h
    });

    const verifyLink = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;

    console.log(`${process.env.CLIENT_URL}/auth/verify-email/${token}`);

    await sendVerificationEmail(userData.email, verifyLink);


    // ✅ Generate Access Token (short-lived)
    const accessToken = generateAccessToken(newUser._id,newUser.role);

    // ✅ Generate Refresh Token (long-lived)
    const refreshToken = generateRefreshToken(newUser._id);

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

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        emailVerifyToken: hashedToken,
        emailVerifyTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return sendResponse(res,400,null,'Invalid or expired token')
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;

    await user.save();

    return sendResponse(res,200,null,'Email verified successfully')
};

const getUserByEmail = async (email) => {
    return User.findOne({email}).lean();
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

function generateEmailVerifyToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return { token, hashedToken };
};

