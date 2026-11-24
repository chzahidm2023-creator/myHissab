const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " name is Required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]*$/, "Please! Add valid number "],
      required: [true, " contact is Required"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please! Add valid email"],
    },
    address: {
      type: String,
      trim: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
      required: true,
    },
    closingReceivable: {
      type: Number,
      default: 0,
    },
    creditLimit: {
      type: Number,
      default: 0,
      required: true,
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

module.exports = mongoose.model("Customer", customerSchema);
