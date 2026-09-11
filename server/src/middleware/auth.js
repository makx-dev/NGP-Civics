const jwt = require('jsonwebtoken');

const protect = (requiredRole = null) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Authentication misconfigured: JWT_SECRET missing' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (requiredRole && decoded.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden for this role' });
    }

    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
