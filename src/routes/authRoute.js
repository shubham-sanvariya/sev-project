import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {
    googleAuth,
    login,
    resendVerificationEmail,
    resetPassword,
    signup,
    verifyEmail
} from "../controller/authController.js";
import {resendLimiter} from "../middleware/reqLimiter.js";


const router = express.Router();

router.post("/auth/login",asyncHandler(login))

router.post("/auth/signup",asyncHandler(signup))

router.post("/reset-password",asyncHandler)

router.get("/auth/verify-email/:token",asyncHandler(verifyEmail))

router.post('/resend-verification', resendLimiter, asyncHandler(resendVerificationEmail));

router.post("/auth/google",asyncHandler(googleAuth))

router.post('/auth/forgot-password', asyncHandler(verifyEmail));
router.post('/auth/reset-password/:token', resetPassword);


export default router;
