const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "SKU is required"],
      uppercase: true,
    },

    barcode: {
      type: String,
      trim: true,
    },

    // Only Category ID will be saved
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Only Brand ID will be saved
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brands",
      default: null,
    },

    // Only Unit ID will be saved
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "units",
      default: null,
    },

    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },

    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: 0,
    },

    openingStock: {
      type: Number,
      required: [true, "opening stock is required"],
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    adjustmentType: {
      type: String,
      enum: ["increase", "decrease"],
    },

    reason: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    stockHistory: [
      {
        productName: {
          type: String,
          trim: true,
          default: "",
        },

        adjustmentType: {
          type: String,
          enum: [
            "increase",
            "decrease",
            "opening-stock",
            "sales",
            "purchases",
            "sale-retuns",
            "purchase-returns",
          ],
          required: true,
        },

        quantity: {
          type: Number,
        },

        reason: {
          type: String,
          trim: true,
          default: "",
        },

        change: {
          type: Number,
        },
        totoalAfter: {
          type: Number,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: "text", sku: 1, barcode: 1 });
module.exports = mongoose.model("Product", productSchema);
