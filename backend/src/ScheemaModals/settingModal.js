const mongoose = require("mongoose");

const businessSettingsSchema = new mongoose.Schema(
  {
    businessDetails: {
      businessName: { type: String, default: "My Business" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      website: { type: String, default: "" },
      currency: { type: String, default: "PKR" },
      logo: { type: String, default: "" },
    },
    invoicePreferences: {
      invoicePrefix: { type: String, default: "INV-" },
      invoiceFooter: {
        type: String,
        default: "Thank you for your business.",
      },
      tax: { type: Number, default: 0, min: 0, max: 100 },
    },
    systemPreferences: {
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
        default: "MM/DD/YYYY",
      },
      defaultPeriod: {
        type: String,
        enum: [
          "today",
          "yesterday",
          "last-7-days",
          "last-15-days",
          "last-30-days",
          "last-60-days",
          "last-90-days",
          "last-6-months",
          "last-1-year",
          "custom",
          "all",
        ],
        default: "all",
      },
      customStartDate: {
        type: Date,
        default: null,
      },
      customEndDate: {
        type: Date,
        default: null,
      },
      paginationLimit: {
        type: Number,
        default: 10,
        min: 1,
        max: 100,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BusinessSettings", businessSettingsSchema);
