const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "expenseCategory",
      required: [true, "Expense category is required"],
    },

    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },

    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },

    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Cash", "Bank", "Card", "Online"],
        message: "Invalid payment method",
      },
      default: "Cash",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    attachment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
