export const requestTracker = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    req.requestId = Math.random().toString(36).substr(2, 9);

    console.log(`📥 [${req.requestId}] ${req.method} ${req.path} - ${req.requestTime}`);
    res.setHeader('X-Request-Id', req.requestId);

    next();
};
