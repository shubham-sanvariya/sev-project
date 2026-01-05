import {sendVerificationEmail} from "../utils/emailservice.js";
import jwt from "jsonwebtoken";

import { OAuth2Client } from "google-auth-library";
import {sendResponse} from "../utils/sendResponse.js";
import User from "../model/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    return ticket.getPayload();
}

export const verifyToken = async (token,res) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        emailVerifyToken: hashedToken,
        emailVerifyTokenExpiry: {$gt: Date.now()}
    });

    if (!user) {
        return sendResponse(res, 400, null, 'Invalid or expired token')
    }

    return user;
}

export const issueVerificationEmail = async (user,uri) => {
    const {token, hashedToken} = generateEmailVerifyToken();

    user.emailVerifyToken = hashedToken;
    user.emailVerifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/auth/${uri}/${token}`;
    await sendVerificationEmail(user.email, verifyLink,uri);
};

export function generateAccessToken(id, role) {
    return jwt.sign(
        {id, role},
        process.env.JWT_SECRET,
        {expiresIn: '15m'} // 15 minutes
    );
}

export function setAccessTokenInRes(res,accessToken){
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
}

export function generateRefreshToken(id) {
    return jwt.sign(
        {id},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn: '7d'} // 7 days
    );
}

export function setRefreshTokenInRes(res,refreshToken){
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

export function generateEmailVerifyToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return {token, hashedToken};
}
