import {loginSchema} from "../dto/LoginReq.js";
import {signupSchema} from "../dto/signupReq.js";
import User from "../model/User.js";
import crypto from 'crypto';
import {sendResponse} from "../utils/sendResponse.js";
import {
    generateAccessToken,
    issueVerificationEmail,
    generateRefreshToken,
    verifyGoogleToken, setAccessTokenInRes, setRefreshTokenInRes
} from "../functions/authFn.js";
import {ResponseType} from "../enum/ReqMessage.js";
import {userDTO} from "../dto/userDTO.js";


export const login = async (req, res) => {
    const {email, password} = loginSchema.parse(req.body);

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return sendResponse(res, 400, null, 'Email is not registered');
    }

    if (!existingUser.isEmailVerified) {
        return res.status(403).json({
            message: 'Please verify your email first'
        });
    }

}

export const signup = async (req, res) => {
    const userData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
        return sendResponse(res, 400, null, 'Email already registered');
    }

    // Create new user
    const newUser = await User.create({
        ...userData,
        isEmailVerified: false // ensure consistent field
    });

    // Issue verification email
    await issueVerificationEmail(newUser);

    // ✅ Generate Access Token (short-lived)
    const accessToken = generateAccessToken(newUser._id, newUser.role);

    // ✅ Generate Refresh Token (long-lived)
    const refreshToken = generateRefreshToken(newUser._id);

    setAccessTokenInRes(res,accessToken);

    setRefreshTokenInRes(res,refreshToken);

    return sendResponse(res, 201, userDTO(newUser), "User registered successfully")
}

const googleAuth = async (req,res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: "Missing credential" });
    }

    // 1️⃣ Verify token with Google
    const payload = await verifyGoogleToken(credential);

    const {
        sub: googleId,
        email,
        name,
        picture
    } = payload;

    let user = await User.findOne({ googleId });
    let statusCode = 200;

    if (!user) {
        // Check if email already exists with local auth
        const existingEmailUser = getUserByEmail(email);

        if (existingEmailUser) {
            return sendResponse(
                res,
                409,
                null,
                "Account exists with email/password. Please link Google login."
            );
        }

        user = await User.create({
            username: name,
            email,
            googleId,
            avatar: picture,
            authProvider: 'google',
            isEmailVerified: true // Google already verified it
        });

        statusCode = 201
    }


    // ✅ Generate Access Token (short-lived)
    const accessToken = generateAccessToken(newUser._id, newUser.role);

    // ✅ Generate Refresh Token (long-lived)
    const refreshToken = generateRefreshToken(newUser._id);

    setAccessTokenInRes(res,accessToken);

    setRefreshTokenInRes(res,refreshToken);

    return sendResponse(res, statusCode, userDTO(user), "Google authentication successful")
}

export const verifyEmail = async (req, res) => {
    const {token} = req.params;

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

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;

    await user.save();

    return sendResponse(res, 200, null, 'Email verified successfully')
};

export const resendVerificationEmail = async (req, res) => {
    const {email} = loginSchema.pick({email: true}).parse(req.body);

    const user = await getUserByEmail(email);

    if (!user) {
        return sendResponse(res, 404, null, 'User not found');
    }

    if (user.isEmailVerified) {
        return sendResponse(res, 400, null, 'Email already verified');
    }

    // Issue new verification email
    await issueVerificationEmail(user);

    return sendResponse(res, 200, null, 'Verification email sent successfully');
};

const getUserByEmail = async (email) => {
    return User.findOne({email}).lean();
}


