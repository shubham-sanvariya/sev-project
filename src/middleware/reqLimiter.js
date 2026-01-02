import rateLimit from "express-rate-limit";

export const resendLimiter = (req, res, next) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 3,
        keyGenerator: (req) => req.body?.email || req.ip,
        message: "Too many requests for this email. Try again later."
    })(req, res, next);
