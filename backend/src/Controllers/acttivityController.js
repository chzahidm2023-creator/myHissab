const mongoose = require("mongoose");
const ActivityLog = require("../ScheemaModals/Administrations/activityLogModal");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const actionMap = {
  create: "Created",
  created: "Created",
  add: "Added",
  added: "Added",
  update: "Updated",
  updated: "Updated",
  edit: "Updated",
  edited: "Updated",
  delete: "Deleted",
  deleted: "Deleted",
  remove: "Deleted",
  removed: "Deleted",
  return: "Returned",
  returned: "Returned",
  login: "Login",
  logout: "Logout",
  activate: "Activated",
  deactivate: "Deactivated",
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const getAllActivityLogs = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const currentPage = Math.max(1, Number(req.pagination?.page) || 1);
    const perPage = Math.min(
      100,
      Math.max(1, Number(req.pagination?.limit) || 10),
    );

    const query = { ...(req.dateQuery || {}) };

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      query.$or = [
        { userName: searchRegex },
        { action: searchRegex },
        { module: searchRegex },
        { recordId: searchRegex },
        { ipAddress: searchRegex },
        { description: searchRegex },
      ];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    const data = await Promise.all(
      logs.map(async (log) => {
        let module = log.module;
        let action = log.action;

        let recordModel =
          log.recordModel || modelMap[normalize(module)] || null;

        if (!recordModel && modelMap[normalize(action)]) {
          recordModel = modelMap[normalize(action)];

          if (actionMap[normalize(module)]) {
            const oldModule = module;
            module = action;
            action = actionMap[normalize(oldModule)];
          }
        }

        if (actionMap[normalize(action)]) {
          action = actionMap[normalize(action)];
        }

        let recordDetails = log.recordSnapshot || null;

        if (
          !recordDetails &&
          log.recordId &&
          recordModel &&
          mongoose.isValidObjectId(log.recordId)
        ) {
          try {
            const pluralize = mongoose.pluralize();
            const collectionName = pluralize
              ? pluralize(recordModel)
              : `${recordModel.toLowerCase()}s`;

            recordDetails = await mongoose.connection.db
              .collection(collectionName)
              .findOne({
                _id: new mongoose.Types.ObjectId(log.recordId),
              });
          } catch (error) {
            console.error(
              `Record lookup failed (${recordModel}):`,
              error.message,
            );
          }
        }

        return {
          ...log,
          action,
          module,
          recordModel,
          recordDetails,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Activity logs fetched successfully",
      pagination: {
        total,
        currentPage,
        totalPages: Math.ceil(total / perPage),
        limit: perPage,
      },
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getAllActivityLogs };
