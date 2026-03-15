const express = require("express");
const { getPermissions } = require("../controllers/permission.controller");
const { protect } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const router = express.Router();

router.get("/", protect, requirePermission("users.view"), getPermissions);

module.exports = router;