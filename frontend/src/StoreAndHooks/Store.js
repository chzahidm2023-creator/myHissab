import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./slices/customerSlice";
import supplierReducer from "./slices/supplierSlice";
import categoryReducer from "./slices/categorySlice";
import expenseCategoryReducer from "./slices/expnCategorySlice";
import brandReducer from "./slices/brandSlice";
import unitReducer from "./slices/unitSlice";
import productReducer from "./slices/productSlice";
import saleInvoiceReducer from "./slices/saleInvoiceSlice";
import paymentReducer from "./slices/paymentSlice";
import purchaseInvoiceReducer from "./slices/purchaseInvSlice";
import expenseReducer from "./slices/expenseSlice";
import teamReducer from "./slices/teamSlice";
import roleReducer from "./slices/roleSlice";
import settingReducer from "./slices/settingSlice";
import authReducer from "./AuthSlice";
import activityReducer from "./slices/acitvitySlice";
import reportReducer from "./slices/reportSlice";
export const store = configureStore({
  reducer: {
    customers: customerReducer,
    suppliers: supplierReducer,
    categories: categoryReducer,
    brands: brandReducer,
    units: unitReducer,
    product: productReducer,
    saleInvoice: saleInvoiceReducer,
    payments: paymentReducer,
    purchaseInvoice: purchaseInvoiceReducer,
    categoriesExense: expenseCategoryReducer,
    expenses: expenseReducer,
    teamMember: teamReducer,
    role: roleReducer,
    businessSettings: settingReducer,
    auth: authReducer,
    activityLogs: activityReducer,
    reports: reportReducer,
  },
});
