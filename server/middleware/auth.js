import { verifyAccessToken, extractTokenFromHeader } from '../utils/auth.js';

/**
 * Middleware to verify JWT and attach user to request
 * Required for all protected routes
 */
export const protect = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = decoded;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional: Get current user without requiring token
 * Used for pages that should show different content for logged-in users
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
      }
    }
  } catch (error) {
    // Continue without auth
  }
  next();
};
