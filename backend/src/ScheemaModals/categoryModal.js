const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    CategoryID: {
      type: String,
      unique: true,
      default: () => "CAT-" + Math.floor(1000 + Math.random() * 9000),
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters long"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
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

module.exports = mongoose.model("Category", categorySchema);
