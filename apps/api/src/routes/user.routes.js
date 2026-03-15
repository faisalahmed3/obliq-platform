const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserPermissions,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const router = express.Router();

router.get("/", protect, requirePermission("users.view"), getUsers);
router.get("/:id", protect, requirePermission("users.view"), getUserById);
router.post("/", protect, requirePermission("users.create"), createUser);
router.patch("/:id", protect, requirePermission("users.edit"), updateUser);
router.put(
  "/:id/permissions",
  protect,
  requirePermission("users.edit"),
  updateUserPermissions
);
router.patch(
  "/:id/status",
  protect,
  requirePermission("users.suspend"),
  updateUserStatus
);

module.exports = router;