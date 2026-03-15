const Permission = require("../models/permission.model");

async function getPermissions(req, res) {
  try {
    const permissions = await Permission.find({}).sort({ module: 1, key: 1 });

    return res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
      error: error.message,
    });
  }
}

module.exports = {
  getPermissions,
};