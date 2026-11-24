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
    originalPurchaseInvoiceNumber: {
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

const puechaseInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      immutable: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supllier",
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
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
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

// Automatically generate invoice number
puechaseInvoiceSchema.pre("save", async function () {
  if (!this.isNew || this.invoiceNumber) return;
  const settings = await BusinessSettings.findOne().select(
    "invoicePreferences.invoicePrefix",
  );
  const prefix = settings?.invoicePreferences?.invoicePrefix || "purchase";
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

module.exports = mongoose.model("PurchaseInvoice", puechaseInvoiceSchema);
