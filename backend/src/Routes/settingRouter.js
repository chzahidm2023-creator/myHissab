const express = require("express");
const settingRouter = express.Router();
const { uploadImage } = require("../MiddleWares/Multer");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../MiddleWares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  getBusinessSettings,
  updateBusinessSettings,
  postBusinessSettings,
} = require("../Controllers/settingController");

settingRouter.post(
  "/add-setting",
  protect,
  checkPermission("settings", "never"),
  activityLogger("Create", "Business Settings"),
  postBusinessSettings,
);

settingRouter.get(
  "/setting-information",
  protect,
  checkPermission("settings", "view"),
  getBusinessSettings,
);

settingRouter.put(
  "/:id",
  protect,
  checkPermission("settings", "edit"),
  uploadImage("logo"),
  activityLogger("Update", "Business Settings"),
  updateBusinessSettings,
);

module.exports = { settingRouter };
