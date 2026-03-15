const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const RolePermission = require("../models/role-permission.model");
const UserPermission = require("../models/user-permission.model");
const resolvePermissions = require("../utils/resolve-permissions");

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.roleId?.name || null,
    roleLabel: user.roleId?.label || null,
    status: user.status,
    managerId: user.managerId || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUsers(req, res) {
  try {
    const users = await User.find({})
      .populate("roleId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users: users.map(formatUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id).populate("roleId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rolePermissionsDocs = await RolePermission.find({
      roleId: user.roleId?._id,
      granted: true,
    });

    const userOverrideDocs = await UserPermission.find({
      userId: user._id,
    });

    const resolvedPermissions = await resolvePermissions(user);

    return res.status(200).json({
      success: true,
      user: formatUser(user),
      rolePermissions: rolePermissionsDocs.map((item) => item.permissionKey),
      userOverrides: userOverrideDocs.map((item) => ({
        permissionKey: item.permissionKey,
        granted: item.granted,
      })),
      resolvedPermissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const roleDoc = await Role.findOne({
      name: role.toLowerCase().trim(),
    });

    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    if (managerId && !mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid manager id",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      roleId: roleDoc._id,
      managerId: managerId || null,
      status: "active",
    });

    const populatedUser = await User.findById(user._id).populate("roleId");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: formatUser(populatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id).populate("roleId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name.trim();
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user",
        });
      }

      user.email = normalizedEmail;
    }

    if (role) {
      const roleDoc = await Role.findOne({
        name: role.toLowerCase().trim(),
      });

      if (!roleDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid role selected",
        });
      }

      user.roleId = roleDoc._id;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate("roleId");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: formatUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
}

async function updateUserPermissions(req, res) {
  try {
    const { id } = req.params;
    const { overrides } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (!Array.isArray(overrides)) {
      return res.status(400).json({
        success: false,
        message: "Overrides must be an array",
      });
    }

    const targetUser = await User.findById(id).populate("roleId");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const actorUser = await User.findById(req.user._id).populate("roleId");

    if (!actorUser) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const actorResolvedPermissions = await resolvePermissions(actorUser);
    const actorPermissionSet = new Set(actorResolvedPermissions);

    const requestedGrantedPermissions = overrides
      .filter((item) => item.granted === true)
      .map((item) => item.permissionKey);

    const invalidPermissions = requestedGrantedPermissions.filter(
      (permissionKey) => !actorPermissionSet.has(permissionKey)
    );

    if (invalidPermissions.length > 0) {
      return res.status(403).json({
        success: false,
        message: "You cannot grant permissions you do not hold yourself",
        invalidPermissions,
      });
    }

    await UserPermission.deleteMany({ userId: targetUser._id });

    const sanitizedOverrides = overrides
      .filter(
        (item) =>
          item &&
          typeof item.permissionKey === "string" &&
          typeof item.granted === "boolean"
      )
      .map((item) => ({
        userId: targetUser._id,
        permissionKey: item.permissionKey,
        granted: item.granted,
        grantedBy: actorUser._id,
      }));

    if (sanitizedOverrides.length > 0) {
      await UserPermission.insertMany(sanitizedOverrides);
    }

    const rolePermissionsDocs = await RolePermission.find({
      roleId: targetUser.roleId?._id,
      granted: true,
    });

    const userOverrideDocs = await UserPermission.find({
      userId: targetUser._id,
    });

    const resolvedPermissions = await resolvePermissions(targetUser);

    return res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      user: formatUser(targetUser),
      rolePermissions: rolePermissionsDocs.map((item) => item.permissionKey),
      userOverrides: userOverrideDocs.map((item) => ({
        permissionKey: item.permissionKey,
        granted: item.granted,
      })),
      resolvedPermissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user permissions",
      error: error.message,
    });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "suspended", "banned"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const user = await User.findById(id).populate("roleId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPermissions,
  updateUserStatus,
};