import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";


const router = express.Router();

router.post("/auth/login",asyncHandler())
