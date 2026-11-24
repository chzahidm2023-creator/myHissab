const mongoose = require("mongoose");

const SupplierScheema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer Name is Required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone Number is Required"],
      match: [/^[0-9+\-\s()]*$/, "Please! Add valid number "],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is Required"],
      unique: true, // 👈 Added this line
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
    timestamps: true, // CreatedAt aur UpdatedAt fields ke liye
  },
);

module.exports = mongoose.model("Supllier", SupplierScheema);
