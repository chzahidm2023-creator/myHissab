const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitID: {
      type: String,
      unique: true,
      default: () => "CAT-" + Math.floor(1000 + Math.random() * 9000),
    },

    name: {
      type: String,
      required: [true, "unit name is required"],
      trim: true,
      unique: true,
      minlength: [1, "unit name must be at least 1 characters long"],
      maxlength: [50, "unit name cannot exceed 50 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("units", unitSchema);
