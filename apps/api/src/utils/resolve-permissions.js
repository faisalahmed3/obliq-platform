const RolePermission = require("../models/role-permission.model");
const UserPermission = require("../models/user-permission.model");

async function resolvePermissions(user) {
  const rolePermissions = await RolePermission.find({
    roleId: user.roleId,
  }).lean();

  const userPermissions = await UserPermission.find({
    userId: user._id,
  }).lean();

  const resolved = new Set(rolePermissions.map((item) => item.permissionKey));

  for (const item of userPermissions) {
    if (item.granted) {
      resolved.add(item.permissionKey);
    } else {
      resolved.delete(item.permissionKey);
    }
  }

  return Array.from(resolved);
}

module.exports = resolvePermissions;
