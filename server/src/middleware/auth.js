const jwt = require('jsonwebtoken');

const protect = (requiredRole = null) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
