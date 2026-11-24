const express = require("express");
const paymentRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const { dateFilter } = require("../MiddleWares/dateFilter");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  getCustomerLedger,
  getSupplierLedger,
  addPartyPayment,
  getAllTransactions,
} = require("../Controllers/AccounstController/paymentsController");

paymentRouter.get(
  "/:partyId/ledger",
  protect,
  checkPermission("customerLedger", "view"),
  getCustomerLedger,
);

paymentRouter.get(
  "/:partyId/ledgerSupplier",
  protect,
  checkPermission("supplierLedger", "view"),
  getSupplierLedger,
);

paymentRouter.post(
  "/add-payments",
  protect,
  checkPermission("payments", "add"),
  activityLogger("Create", "Party Payment"),
  addPartyPayment,
);

paymentRouter.get(
  "/all-payments",
  protect,
  checkPermission("payments", "view"),
  dateFilter("paymentDate"),
  getAllTransactions,
);

module.exports = { paymentRouter };
