const express = require("express");
const reportRouter = express.Router();
const { dateFilter } = require("../MiddleWares/dateFilter");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const {
  getSalesReports,
  getPurchaseReports,
  getExpenseReport,
  getProductsReport,
  getSotckReports,
  getPaymentReports,
} = require("../Controllers/reportController/reportcontroller");
reportRouter.get(
  "/sales-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("createdAt"),
  getSalesReports,
);

reportRouter.get(
  "/purchase-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("createdAt"),
  getPurchaseReports,
);

reportRouter.get(
  "/expense-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("createdAt"),
  getExpenseReport,
);
reportRouter.get(
  "/products-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("createdAt"),
  getProductsReport,
);

reportRouter.get(
  "/stockmovement-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("createdAt"),
  getSotckReports,
);
reportRouter.get(
  "/payment-reports",
  protect,
  checkPermission("reports", "view"),
  dateFilter("paymentDate"),
  getPaymentReports,
);
module.exports = { reportRouter };
