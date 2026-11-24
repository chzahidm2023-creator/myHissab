const express = require("express");
const { dateFilter } = require("../MiddleWares/dateFilter");
const salesInvoiceRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  postSaleInvoice,
  getAllSaleInvoices,
  returnSaleInvoice,
  getSaleInvoiceById,
  getAllSaleReturns,
} = require("../Controllers/saleInvoiceController");
salesInvoiceRouter.post(
  "/add",
  protect,
  checkPermission("sales", "add"),
  activityLogger("Create", "Sale Invoice"),
  postSaleInvoice,
);

salesInvoiceRouter.get(
  "/list",
  protect,
  checkPermission("sales", "view"),
  dateFilter("createdAt"),
  getAllSaleInvoices,
);

salesInvoiceRouter.get("/invoiceDetails/:id", getSaleInvoiceById);

salesInvoiceRouter.put(
  "/return/:id",
  protect,
  checkPermission("salesReturns", "add"),
  activityLogger("Create", "Sale Return"),
  returnSaleInvoice,
);

salesInvoiceRouter.get(
  "/return-list",
  protect,
  checkPermission("salesReturns", "view"),
  dateFilter("returnList.returnDate"),
  getAllSaleReturns,
);

module.exports = { salesInvoiceRouter };
