const express = require("express");
const supplierRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const { dateFilter } = require("../MiddleWares/dateFilter");
const {
  addSupplier,
  updateSupplier,
  getAllSupplier,
  getSupplierById,
  deleteSupplier,
} = require("../Controllers/supplierController");

supplierRouter.post(
  "/add-supplier",
  protect,
  checkPermission("suppliers", "add"),
  activityLogger("Create", "Supplier"),
  addSupplier,
);

supplierRouter.get(
  "/list",
  protect,
  checkPermission("suppliers", "view"),
  dateFilter("createdAt"),
  getAllSupplier,
);

supplierRouter.get(
  "/:id",
  protect,
  checkPermission("suppliers", "view"),
  getSupplierById,
);

supplierRouter.put(
  "/update-supplier/:id",
  protect,
  checkPermission("suppliers", "edit"),
  activityLogger("Update", "Supplier"),
  updateSupplier,
);

supplierRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("suppliers", "delete"),
  activityLogger("Delete", "Supplier"),
  deleteSupplier,
);

module.exports = { supplierRouter };
