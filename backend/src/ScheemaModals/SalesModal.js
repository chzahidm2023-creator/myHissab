const mongoose = require("mongoose");
const BusinessSettings = require("./settingModal");

const returnsInformation = [
  {
    returnInvoiceNumber: {
      type: String,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    returnAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalSaleInvoiceNumber: {
      type: String,
      required: true,
    },
    returnedItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0.01,
        },
      },
    ],
  },
];

const saleInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      immutable: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    returns: {
      type: Number,
      default: 0,
    },
    returnList: returnsInformation,
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
    notes: {
      type: String,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

saleInvoiceSchema.pre("save", async function () {
  if (!this.isNew || this.invoiceNumber) return;

  const settings = await BusinessSettings.findOne().select(
    "invoicePreferences.invoicePrefix",
  );

  const prefix = settings?.invoicePreferences?.invoicePrefix || "SALE";
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const lastInvoice = await this.constructor
    .findOne({
      invoiceNumber: new RegExp(`^${escapedPrefix}-\\d+$`),
    })
    .sort({ invoiceNumber: -1 });

  const lastNumber = lastInvoice
    ? Number(lastInvoice.invoiceNumber.split("-").pop())
    : 0;

  this.invoiceNumber = `${prefix}-${String(lastNumber + 1).padStart(4, "0")}`;
});

module.exports = mongoose.model("SaleInvoice", saleInvoiceSchema);
