const express = require("express");
const purchaseInvoiceRouter = express.Router();
const { dateFilter } = require("../MiddleWares/dateFilter");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  postPurchaseInvoice,
  getAllPurchaseInvoices,
  returnPurchaseInvoice,
  getSaleInvoiceById,
  getAllPurchaseReturns,
} = require("../Controllers/purchaseInvoiceController");
purchaseInvoiceRouter.post(
  "/add",
  protect,
  checkPermission("purchases", "add"),
  activityLogger("Create", "Purchase Invoice"),
  postPurchaseInvoice,
);

purchaseInvoiceRouter.get(
  "/list",
  protect,
  checkPermission("purchases", "view"),
  dateFilter("createdAt"),
  getAllPurchaseInvoices,
);

purchaseInvoiceRouter.get(
  "/invoiceDetails/:id",
  protect,
  checkPermission("purchases", "view"),
  getSaleInvoiceById,
);

purchaseInvoiceRouter.put(
  "/return/:id",
  protect,
  checkPermission("purchaseReturns", "add"),
  activityLogger("Create", "Purchase Return"),
  returnPurchaseInvoice,
);

purchaseInvoiceRouter.get(
  "/return-list",
  protect,
  checkPermission("purchaseReturns", "view"),
  dateFilter("returnList.returnDate"),
  getAllPurchaseReturns,
);

module.exports = { purchaseInvoiceRouter };
