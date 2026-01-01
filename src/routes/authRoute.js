import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {login, signup, verifyEmail} from "../controller/authController.js";


const router = express.Router();

router.post("/auth/login",asyncHandler(login))

router.post("/auth/signup",asyncHandler(signup))

router.get("/auth/verify-email/:token",asyncHandler(verifyEmail))

export default router;
