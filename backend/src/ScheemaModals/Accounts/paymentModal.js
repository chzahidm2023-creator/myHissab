const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ["invoice", "payment", "opening", "invoiceReturn"],
    },
    direction: {
      type: String,
      required: true,
      enum: ["debit", "credit"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    runningBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "card", "other"],
      default: "cash",
    },
    cashAccountNo: {
      type: String,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    ref: {
      type: String,
      default: null,
    },
    notes: String,
  },
  { timestamps: true },
);

const partyAccountSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    partyName: {
      type: String,
      required: true,
      trim: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    closingReceivable: {
      type: Number,
      default: 0,
    },
    closingPayable: {
      type: Number,
      default: 0,
    },
    transactions: {
      type: [transactionHistorySchema],
      default: [],
    },
  },
  { _id: false },
);

const transactionRecords = new mongoose.Schema(
  {
    partyType: {
      type: String,
      required: true,
      enum: ["customer", "supplier"],
    },
    customer: {
      type: partyAccountSchema,
      default: null,
    },
    supplier: {
      type: partyAccountSchema,
      default: null,
    },
  },
  { timestamps: true },
);

transactionRecords.index(
  { "customer.partyId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      partyType: "customer",
    },
  },
);

transactionRecords.index(
  { "supplier.partyId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      partyType: "supplier",
    },
  },
);

transactionRecords.pre("validate", function () {
  if (this.partyType === "customer") {
    this.supplier = null;

    if (!this.customer?.partyId) {
      throw new Error("Customer ID is required");
    }
  }

  if (this.partyType === "supplier") {
    this.customer = null;

    if (!this.supplier?.partyId) {
      throw new Error("Supplier ID is required");
    }
  }
});

module.exports = mongoose.model("Trasaction-Records", transactionRecords);
