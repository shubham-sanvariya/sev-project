import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {login, resendVerificationEmail, signup, verifyEmail} from "../controller/authController.js";
import {resendLimiter} from "../middleware/reqLimiter.js";


const router = express.Router();

router.post("/auth/login",asyncHandler(login))

router.post("/auth/signup",asyncHandler(signup))

router.get("/auth/verify-email/:token",asyncHandler(verifyEmail))

router.post('/resend-verification', resendLimiter, asyncHandler(resendVerificationEmail));

export default router;
