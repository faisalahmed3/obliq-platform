const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permissionKey: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

rolePermissionSchema.index({ roleId: 1, permissionKey: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", rolePermissionSchema);