const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const RolePermission = require("../models/role-permission.model");

dotenv.config();

const roles = [
  { name: "admin", label: "Admin", level: 1 },
  { name: "manager", label: "Manager", level: 2 },
  { name: "agent", label: "Agent", level: 3 },
  { name: "customer", label: "Customer", level: 4 },
];

const permissions = [
  { key: "dashboard.view", label: "View Dashboard", module: "dashboard" },
  { key: "users.view", label: "View Users", module: "users" },
  { key: "users.create", label: "Create Users", module: "users" },
  { key: "users.edit", label: "Edit Users", module: "users" },
  { key: "users.suspend", label: "Suspend Users", module: "users" },
  { key: "tasks.view", label: "View Tasks", module: "tasks" },
  { key: "reports.view", label: "View Reports", module: "reports" },
  { key: "settings.view", label: "View Settings", module: "settings" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Role.deleteMany({});
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});

    const createdRoles = await Role.insertMany(roles);
    const createdPermissions = await Permission.insertMany(permissions);

    const roleMap = Object.fromEntries(createdRoles.map((r) => [r.name, r]));
    const permissionKeys = createdPermissions.map((p) => p.key);

    const rolePermissions = [
      ...permissionKeys.map((key) => ({
        roleId: roleMap.admin._id,
        permissionKey: key,
      })),

      { roleId: roleMap.manager._id, permissionKey: "dashboard.view" },
      { roleId: roleMap.manager._id, permissionKey: "users.view" },
      { roleId: roleMap.manager._id, permissionKey: "tasks.view" },
      { roleId: roleMap.manager._id, permissionKey: "reports.view" },

      { roleId: roleMap.agent._id, permissionKey: "dashboard.view" },
      { roleId: roleMap.agent._id, permissionKey: "tasks.view" },

      { roleId: roleMap.customer._id, permissionKey: "dashboard.view" },
    ];

    await RolePermission.insertMany(rolePermissions);

    console.log("Seed completed");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();