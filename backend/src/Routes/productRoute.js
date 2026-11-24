const express = require("express");
const productRouter = express.Router();
const { uploadImage } = require("../MiddleWares/Multer");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const { dateFilter } = require("../MiddleWares/dateFilter");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  updateStockAdjustment,
  getAllStockHistory,
} = require("../Controllers/productController");

productRouter.post(
  "/add-product",
  protect,
  checkPermission("products", "add"),
  uploadImage("product-image"),
  activityLogger("products", "Created", "New product created"),
  createProduct,
);

productRouter.get(
  "/list",
  protect,
  checkPermission("products", "view"),
  dateFilter("createdAt"),
  getProducts,
);

productRouter.put(
  "/update-product/:id",
  protect,
  checkPermission("products", "edit"),
  uploadImage("product-image"),
  activityLogger("products", "Updated", "Product updated"),
  updateProduct,
);

productRouter.patch(
  "/adjustStock/:id",
  protect,
  checkPermission("stockAdjustments", "add"),
  activityLogger("stockAdjustments", "Adjusted", "Product stock adjusted"),
  updateStockAdjustment,
);

productRouter.delete(
  "/delete-product/:id",
  protect,
  checkPermission("products", "delete"),
  activityLogger("products", "Deleted", "Product deleted"),
  deleteProduct,
);

productRouter.get(
  "/stock-history/list",
  protect,
  checkPermission("stockAdjustments", "view"),
  dateFilter("stockHistory.date"),
  getAllStockHistory,
);
module.exports = { productRouter };
