export const sendResponse = (res, statusCode, data, message = null) => {
    const response = {
        success: statusCode < 400,
        message,
        data,
        timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
};
