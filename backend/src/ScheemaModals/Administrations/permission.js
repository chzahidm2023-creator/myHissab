const MODULE_PERMISSIONS = {
  activityLogs: ["view"],
  brands: ["view", "add", "edit", "delete"], //done
  categories: ["view", "add", "edit", "delete"], //done
  customers: ["view", "add", "edit", "delete"], //done
  dashboard: ["view"],
  expenseCategories: ["view", "add", "edit", "delete"], //done
  expenses: ["view", "add", "edit", "delete"], //done
  inventory: ["view"],
  payments: ["view", "add"], //done
  customerLedger: ["view"], // done
  supplierLedger: ["view"], //done
  products: ["view", "add", "edit", "delete"], //done
  purchaseReturns: ["view", "add"], //done
  purchases: ["view", "add"], //done
  reports: ["view"],
  roles: ["view", "add", "edit", "delete"],
  salesReturns: ["view", "add"], //done
  sales: ["view", "add"], //dones
  settings: ["view", "edit"], //done
  stockAdjustments: ["view", "add"], //done half
  suppliers: ["view", "add", "edit", "delete"],
  units: ["view", "add", "edit", "delete"], //done
  users: ["view", "add", "edit", "delete"], //done
};

const ALL_PERMISSIONS = Object.entries(MODULE_PERMISSIONS).flatMap(
  ([module, actions]) => actions.map((action) => `${module}.${action}`),
);

module.exports = {
  MODULE_PERMISSIONS,
  ALL_PERMISSIONS,
};
