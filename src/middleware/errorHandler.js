import {ZodError} from "zod";

export const errorHandler = (err, req, res, next) => {
    console.error(err);

    // ✅ Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: err.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            })),
            timestamp: new Date().toISOString()
        });
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Something went wrong!';

    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};

