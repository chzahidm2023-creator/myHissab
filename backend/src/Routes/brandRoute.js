const express = require("express");
const brandRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const { dateFilter } = require("../MiddleWares/dateFilter");
const activityLogger = require("../MiddleWares/activityLogger");

const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../Controllers/brandController");

brandRouter.post(
  "/add-brand",
  protect,
  checkPermission("brands", "add"),
  activityLogger("brands", "Created", "New brand created"),
  createBrand,
);

brandRouter.get(
  "/list",
  protect,
  checkPermission("brands", "view"),
  dateFilter("createdAt"),
  getAllBrands,
);

brandRouter.get(
  "/:id",
  protect,
  checkPermission("brands", "view"),
  getBrandById,
);

brandRouter.put(
  "/update-brand/:id",
  protect,
  checkPermission("brands", "edit"),
  activityLogger("brands", "Updated", "Brand updated"),
  updateBrand,
);

brandRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("brands", "delete"),
  activityLogger("brands", "Deleted", "Brand deleted"),
  deleteBrand,
);

module.exports = { brandRouter };
