import jwt from 'jsonwebtoken';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }

        // Check user existence
        if (!decoded.isActive) {
            return res.status(403).json({ error: 'User inactive' });
        }

        req.user = decoded; // already has id, role, etc.
        next();
    });
};

export default authenticateToken;
