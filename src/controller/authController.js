import {loginSchema} from "../dto/LoginReq.js";
import {signupSchema} from "../dto/signupReq.js";
import User from "../model/User.js";
import {sendResponse} from "../utils/sendResponse.js";
import {
    generateAccessToken,
    issueVerificationEmail,
    generateRefreshToken,
    verifyGoogleToken, setAccessTokenInRes, setRefreshTokenInRes, verifyToken
} from "../functions/authFn.js";
import {userDTO} from "../dto/userDTO.js";
import bcrypt from "bcryptjs";


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

    // 🔐 Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
    );

    if (!isPasswordValid) {
        return sendResponse(res, 400, null, 'Invalid email or password');
    }

    // ✅ Generate tokens
    const accessToken = generateAccessToken(
        existingUser._id,
        existingUser.role
    );

    const refreshToken = generateRefreshToken(existingUser._id);

    // 🍪 Set cookies
    setAccessTokenInRes(res, accessToken);
    setRefreshTokenInRes(res, refreshToken);

    return sendResponse(
        res,
        200,
        userDTO(existingUser),
        'Login successful'
    );

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
    await issueVerificationEmail(newUser,"verify-email");

    // ✅ Generate Access Token (short-lived)
    const accessToken = generateAccessToken(newUser._id, newUser.role);

    // ✅ Generate Refresh Token (long-lived)
    const refreshToken = generateRefreshToken(newUser._id);

    setAccessTokenInRes(res,accessToken);

    setRefreshTokenInRes(res,refreshToken);

    return sendResponse(res, 201, userDTO(newUser), "User registered successfully")
}

export const googleAuth = async (req,res) => {
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

export const resetPassword = async (req,res) => {
    const {token} = req.params;

    const { password } = loginSchema.pick({ password: true}).parse(req.body);


    const user = await verifyToken(token,res);

    user.password = password;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;

    await user.save();

    return sendResponse(res, 200, null, 'Password reset successful');
}

export const verifyEmail = async (req, res) => {
    const {token} = req.params;

    const user = await verifyToken(token,res);

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;

    await user.save();

    return sendResponse(res, 200, null, 'Email verified successfully')
};

export const resendVerificationEmail = async (req, res) => {
    const {email} = loginSchema.pick({email: true}).parse(req.body);

    const user = await getUserByEmail(email);

    // Always return success to avoid email enumeration attacks
    if (!user) {
        return sendResponse(
            res,
            200,
            null,
            'If an account exists, a password reset email has been sent'
        );
    }

    if (user.isEmailVerified) {
        return sendResponse(res, 400, null, 'Email already verified');
    }

    // Issue new verification email
    await issueVerificationEmail(user,"verify-email");

    return sendResponse(res, 200, null, 'Verification email sent successfully');
};

const getUserByEmail = async (email) => {
    return User.findOne({email}).lean();
}


