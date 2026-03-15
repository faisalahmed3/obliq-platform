const resolvePermissions = require("../utils/resolve-permissions");

function requirePermission(permissionKey) {
  return async function (req, res, next) {
    try {
      const permissions = await resolvePermissions(req.user);

      if (!permissions.includes(permissionKey)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      req.permissions = permissions;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
}

module.exports = {
  requirePermission,
};