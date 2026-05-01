/**
 * Role-Based Access Control Middleware
 * Use after protect middleware to enforce role restrictions
 */

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

/**
 * Check if user is owner of a resource
 * Usage: Before checking ownership, fetch the resource and pass it
 * Example: if (req.params.projectId !== req.user.userId) throw error
 */
export const isOwner = (resourceOwnerId) => {
  return (req, res, next) => {
    if (req.userRole === 'admin' || resourceOwnerId === req.userId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'You do not have permission to access this resource',
    });
  };
};
