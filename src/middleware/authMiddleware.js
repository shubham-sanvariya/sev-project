const jwt = require('jsonwebtoken');

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
            // Optional extra checks
            algorithms: ['HS256'], // enforce algorithm
            // issuer: 'your-app-name', // uncomment if you want to check issuer
            // audience: 'your-app-users', // uncomment if you want to check audience
        },
        (err, decoded) => {
            if (err) {
                // Differentiate errors
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }

            // Check expiration manually (though jwt.verify already does this)
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({ error: 'Token expired' });
            }

            // Attach user payload to request
            req.user = decoded;
            next();
        }
    );
};
