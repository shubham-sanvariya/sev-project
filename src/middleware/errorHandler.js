export const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Default values
    let statusCode = 500;
    let message = 'Something went wrong!';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message || 'Invalid data provided';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    } else if (err.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Database connection failed';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
};
