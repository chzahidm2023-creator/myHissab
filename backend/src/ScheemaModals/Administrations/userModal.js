const mongoose = require("mongoose");

const { ALL_PERMISSIONS } = require("./permission");
const teamMemberSchema = new mongoose.Schema(
  {
    // BASIC INFORMATION

    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // SHARED ROLES

    assignedRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    individualPermissions: {
      type: [String],
      enum: ALL_PERMISSIONS,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
