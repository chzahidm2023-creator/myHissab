import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./StoreAndHooks/Store";
import ErrorPopup from "./components/ErrorPopup";
import AdminLogin from "./Pages/Auth/Adminlogin";
import Dashboard from "./Pages/Admin/Worksapce/Overview";
import AdminLayout from "./layouts/AdminLayout";
import SaleAndInvoice from "./Pages/Admin/Worksapce/Sale&Invoice";
import Purchases from "./Pages/Admin/Worksapce/Purchases";
import Customers from "./Pages/Admin/Worksapce/Customers";
import Suppliers from "./Pages/Admin/Worksapce/Suppliers";
import Products from "./Pages/Admin/Inventory/Products";
import Categories from "./Pages/Admin/Inventory/Categories";
import Brand from "./Pages/Admin/Inventory/Brand";
import Units from "./Pages/Admin/Inventory/Units";
import StockOverview from "./Pages/Admin/Inventory/StockOverview";
import SaleReturns from "./Pages/Admin/Accounting/SaleReturns";
import PurchaseReturns from "./Pages/Admin/Accounting/PurchaseReturns";
import Expense from "./Pages/Admin/Accounting/Expense";
import ExpenseCategories from "./Pages/Admin/Accounting/ExpenseCategories";
import Payments from "./Pages/Admin/Accounting/Payments";
import Reports from "./Pages/Admin/Accounting/Reports";
import TeamPermissions from "./Pages/Admin/Administration/TeamPermissions";
import Roles from "./Pages/Admin/Administration/Roles";
import Settings from "./Pages/Admin/Administration/Settings";
import ActivityLog from "./Pages/Admin/Administration/ActivityLog";
import ProtectedRoute from "./components/Protected";
import NotFound from "./Pages/Auth/Page404";

function App() {
  return (
    <Provider store={store}>
      <ErrorPopup />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales-invoices" element={<SaleAndInvoice />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="customers" element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brand />} />
            <Route path="Units" element={<Units />} />
            <Route path="stocks" element={<StockOverview />} />
            <Route path="sale-return" element={<SaleReturns />} />
            <Route path="purchase-return" element={<PurchaseReturns />} />
            <Route path="expense" element={<Expense />} />
            <Route path="exense-categories" element={<ExpenseCategories />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="team-permissions" element={<TeamPermissions />} />
            <Route path="team-roles" element={<Roles />} />
            <Route path="setting" element={<Settings />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Provider>
  );
}

export default App;
