const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");

const modelMap = {
  product: "Product",
  products: "Product",
  brand: "Brand",
  brands: "Brand",
  category: "Category",
  categories: "Category",
  customer: "Customer",
  customers: "Customer",
  supplier: "Supplier",
  suppliers: "Supplier",
  unit: "Unit",
  units: "Unit",
  user: "TeamMember",
  users: "TeamMember",
  teammember: "TeamMember",
  teammembers: "TeamMember",
  role: "Role",
  roles: "Role",
  expense: "Expense",
  expenses: "Expense",
  expensecategory: "ExpenseCategory",
  expensecategories: "ExpenseCategory",
  sale: "SaleInvoice",
  sales: "SaleInvoice",
  saleinvoice: "SaleInvoice",
  saleinvoices: "SaleInvoice",
  purchase: "PurchaseInvoice",
  purchases: "PurchaseInvoice",
  purchaseinvoice: "PurchaseInvoice",
  purchaseinvoices: "PurchaseInvoice",
};

const actions = [
  "create",
  "created",
  "add",
  "added",
  "update",
  "updated",
  "edit",
  "edited",
  "delete",
  "deleted",
  "remove",
  "removed",
  "return",
  "returned",
  "login",
  "logout",
  "activate",
  "deactivate",
];

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const isDeleteAction = (action) =>
  ["delete", "deleted", "remove", "removed"].includes(normalize(action));

const getRecordId = (req) => {
  if (req.params?.id && mongoose.isValidObjectId(req.params.id)) {
    return req.params.id;
  }

  const ids = Object.values(req.params || {}).filter((value) =>
    mongoose.isValidObjectId(value),
  );

  return ids.length ? ids[ids.length - 1] : null;
};

const getCollectionName = (modelName) => {
  const pluralize = mongoose.pluralize();
  return pluralize ? pluralize(modelName) : `${modelName.toLowerCase()}s`;
};

const activityLogger = (first, second, description = "") => {
  let module = first;
  let action = second;

  if (
    actions.includes(normalize(first)) &&
    !actions.includes(normalize(second))
  ) {
    module = second;
    action = first;
  }

  const recordModel = modelMap[normalize(module)] || null;

  return async (req, res, next) => {
    const recordId = getRecordId(req);
    let recordSnapshot = null;

    if (
      isDeleteAction(action) &&
      recordId &&
      recordModel &&
      mongoose.connection.db
    ) {
      try {
        const collectionName = getCollectionName(recordModel);

        recordSnapshot = await mongoose.connection.db
          .collection(collectionName)
          .findOne({
            _id: new mongoose.Types.ObjectId(recordId),
          });
      } catch (error) {
        console.error("Activity snapshot error:", error.message);
      }
    }

    const originalJson = res.json;
    const originalSend = res.send;

    const captureRecordId = (body) => {
      if (!body || typeof body !== "object") return;

      let data = body.data || body;

      if (Array.isArray(data)) data = data[0];

      res.locals.recordId =
        data?._id ||
        data?.id ||
        data?.product?._id ||
        data?.customer?._id ||
        data?.supplier?._id ||
        data?.invoice?._id ||
        data?.data?._id ||
        res.locals.recordId ||
        null;
    };

    res.json = function (body) {
      captureRecordId(body);
      return originalJson.call(this, body);
    };

    res.send = function (body) {
      if (typeof body === "string") {
        try {
          captureRecordId(JSON.parse(body));
        } catch (error) {}
      } else {
        captureRecordId(body);
      }

      return originalSend.call(this, body);
    };

    res.once("finish", async () => {
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      await logActivity({
        req,
        userId: req.userId,
        userName: req.userName,
        action,
        module,
        recordId: res.locals.recordId || recordId || null,
        recordModel,
        recordSnapshot,
        description,
      });
    });

    next();
  };
};

module.exports = activityLogger;
