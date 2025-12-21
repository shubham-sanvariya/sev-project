export const responseTracker = (req, res, next) => {
    res.on('finish', () => {
        console.log(`📤 [${req.requestId}] Response sent - ${res.statusCode}`);
    });
    next();
};
