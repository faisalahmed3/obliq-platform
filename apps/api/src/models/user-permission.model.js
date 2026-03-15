const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissionKey: {
      type: String,
      required: true,
      trim: true,
    },
    granted: {
      type: Boolean,
      default: true,
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userPermissionSchema.index({ userId: 1, permissionKey: 1 }, { unique: true });

module.exports = mongoose.model("UserPermission", userPermissionSchema);