import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Search, Download, RefreshCw } from "lucide-react";
import {
  getAllSaleInvoices,
  getAllSaleReturns,
} from "../../../StoreAndHooks/slices/saleInvoiceSlice";
import {
  getAllPurchaseInvoices,
  getAllPurchaseReturns,
} from "../../../StoreAndHooks/slices/purchaseInvSlice";
import {
  getSalesReports,
  getPurchaseReports,
  getExpenseReports,
  getProductsReport,
  getStockMovementReports,
  getPaymentReports,
} from "../../../StoreAndHooks/slices/reportSlice";
import { getCustomerList } from "../../../StoreAndHooks/slices/customerSlice";
import { getSupplierList } from "../../../StoreAndHooks/slices/supplierSlice";
import { getSetting } from "../../../StoreAndHooks/slices/settingSlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import Pagination from "../../../components/Pagination";

const reportCategories = [
  {
    category: "Sales",
    options: [
      { id: "sales", label: "Sales" },
      { id: "daily_sales", label: "Daily sales", type: "daily" },
      { id: "weekly_sales", label: "Weekly sales", type: "weekly" },
      { id: "monthly_sales", label: "Monthly sales", type: "monthly" },
      { id: "customer_sales", label: "Customer sales", type: "customer" },
      { id: "product_sales", label: "Product sales", type: "product" },
      { id: "sales_returns", label: "Sales returns" },
    ],
  },
  {
    category: "Purchases",
    options: [
      { id: "purchases", label: "Purchases" },
      {
        id: "supplier_purchases",
        label: "Purchase by Supplier",
        type: "supplier",
      },
      {
        id: "product_purchases",
        label: "Purchase by Product",
        type: "product",
      },
      { id: "purchase_returns", label: "Purchase returns" },
    ],
  },
  {
    category: "Expenses",
    options: [
      { id: "expenses", label: "Expenses", type: "category" },
      { id: "category_expenses", label: "Category expenses", type: "category" },
    ],
  },
  {
    category: "Inventory",
    options: [
      { id: "stock", label: "Stock" },
      { id: "low_stock", label: "Low stock" },
      { id: "movements", label: "Movements" },
      { id: "valuation", label: "Valuation" },
    ],
  },
  {
    category: "Payments",
    options: [
      { id: "customerReceivables", label: "Receivables" },
      { id: "supplierPayables", label: "Payables" },
      { id: "customerPayments", label: "Customer Payment" },
      { id: "supplierPayments", label: "Supplier Payment" },
    ],
  },
];

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatSettingDate = (date) => {
  if (!date) return "";
  return String(date).slice(0, 10);
};

export default function BusinessReports() {
  const dispatch = useDispatch();
  const formatDate = useDateFormat();
  const [searchParams, setSearchParams] = useSearchParams();

  const salesState = useSelector((state) => state.saleInvoice || {});
  const purchaseState = useSelector((state) => state.purchaseInvoice || {});
  const reportState = useSelector((state) => state.reports || {});
  const settingsState = useSelector((state) => state.businessSettings || {});

  const settings = settingsState.settings || {};
  const settingsLoading = settingsState.loading || false;
  const settingsReady = Boolean(settings.systemPreferences);

  const {
    invoices: salesInvoices = [],
    loading: salesLoading,
    totalPages: salesTotalPages,
    totalInvoices: salesTotalInvoices,
    returns: salesReturns = [],
    returnsLoading: salesReturnsLoading,
    returnsTotalPages: salesReturnsTotalPages,
    totalReturns: salesTotalReturns,
  } = salesState;

  const {
    invoices: purchaseInvoices = [],
    loading: purchaseLoading,
    totalPages: purchaseTotalPages,
    totalInvoices: purchaseTotalInvoices,
    returns: purchaseReturns = purchaseState.purchaseReturns || [],
    returnsLoading: purchaseReturnsLoading,
    returnsTotalPages: purchaseReturnsTotalPages,
    totalReturns: purchaseTotalReturns,
  } = purchaseState;

  const salesReport = reportState.sales || {};
  const purchaseReport = reportState.purchases || {};
  const expenseReport = reportState.expenses || {};
  const productReport = reportState.products || {};
  const stockMovementReport = reportState.stockMovements || {};
  const paymentReport = reportState.paymentReports || {};

  const currency = settings.businessDetails?.currency || "PKR";
  const preferences = settings.systemPreferences || {};

  const paginationLimit = Math.max(
    1,
    Number(preferences.paginationLimit) || 10,
  );

  const period = String(preferences.defaultPeriod).toLowerCase();
  const startDate = formatSettingDate(preferences.customStartDate);
  const endDate = formatSettingDate(preferences.customEndDate);

  const selectedReport = searchParams.get("type") || "sales";
  const searchTerm = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [refreshKey, setRefreshKey] = useState(0);

  const selectedOption = reportCategories
    .flatMap((group) => group.options)
    .find((option) => option.id === selectedReport);

  const reportType = selectedOption?.type;

  const isSales = selectedReport === "sales";
  const isSalesReturns = selectedReport === "sales_returns";
  const isPurchase = selectedReport === "purchases";
  const isPurchaseReturns = selectedReport === "purchase_returns";

  const isExpenseAggregate = ["expenses", "category_expenses"].includes(
    selectedReport,
  );

  const isSalesAggregate = [
    "daily_sales",
    "weekly_sales",
    "monthly_sales",
    "customer_sales",
    "product_sales",
  ].includes(selectedReport);

  const isPurchaseAggregate = [
    "supplier_purchases",
    "product_purchases",
  ].includes(selectedReport);

  const isProductReport = ["stock", "low_stock"].includes(selectedReport);
  const isStockMovement = selectedReport === "movements";

  const isPaymentReport = [
    "customerReceivables",
    "supplierPayables",
    "customerPayments",
    "supplierPayments",
  ].includes(selectedReport);

  const isAggregate =
    isSalesAggregate ||
    isPurchaseAggregate ||
    isExpenseAggregate ||
    isProductReport ||
    isStockMovement ||
    isPaymentReport;

  const activeReport = isPaymentReport
    ? paymentReport
    : isStockMovement
      ? stockMovementReport
      : isProductReport
        ? productReport
        : isExpenseAggregate
          ? expenseReport
          : isPurchaseAggregate
            ? purchaseReport
            : salesReport;

  const reportData = activeReport.data || [];
  const reportPagination = activeReport.pagination || {};
  const reportLoading = activeReport.loading || false;

  const loading = isAggregate
    ? reportLoading
    : isSales
      ? salesLoading
      : isSalesReturns
        ? salesReturnsLoading
        : isPurchase
          ? purchaseLoading
          : isPurchaseReturns
            ? purchaseReturnsLoading
            : false;

  const data = isAggregate
    ? reportData
    : isSales
      ? salesInvoices
      : isSalesReturns
        ? salesReturns
        : isPurchase
          ? purchaseInvoices
          : isPurchaseReturns
            ? purchaseReturns
            : [];

  const totalPages = isAggregate
    ? reportPagination.totalPages || 1
    : isSales
      ? salesTotalPages || 1
      : isSalesReturns
        ? salesReturnsTotalPages || 1
        : isPurchase
          ? purchaseTotalPages || 1
          : isPurchaseReturns
            ? purchaseReturnsTotalPages || 1
            : 1;

  const totalRecords = isAggregate
    ? (reportPagination.totalRecords ??
      reportPagination.totalHistory ??
      reportPagination.totalProducts ??
      reportPagination.total ??
      0)
    : isSales
      ? salesTotalInvoices || 0
      : isSalesReturns
        ? salesTotalReturns || 0
        : isPurchase
          ? purchaseTotalInvoices || 0
          : isPurchaseReturns
            ? purchaseTotalReturns || 0
            : 0;

  const pages = Math.max(1, Number(totalPages) || 1);
  const activePage = Math.min(page, pages);
  const startIndex = (activePage - 1) * paginationLimit;

  useEffect(() => {
    if (!settings && !settingsLoading) {
      dispatch(getSetting());
    }
  }, [dispatch, settings, settingsLoading]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    params.set("type", selectedReport);
    params.set("page", String(page));

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }

    params.delete("period");
    params.delete("startDate");
    params.delete("endDate");

    setSearchParams(params, { replace: true });

    if (!settingsReady) return;

    const timer = setTimeout(() => {
      const dateParams = {
        period,
        ...(period === "custom" &&
          startDate &&
          endDate && { startDate, endDate }),
      };

      const commonParams = {
        page,
        limit: paginationLimit,
        search: searchTerm.trim(),
        sortBy: "createdAt",
        sortOrder: "desc",
        ...dateParams,
      };

      if (isSales) {
        dispatch(getAllSaleInvoices(commonParams));
      } else if (isSalesReturns) {
        dispatch(getAllSaleReturns(commonParams));
      } else if (isPurchase) {
        dispatch(getAllPurchaseInvoices(commonParams));
      } else if (isPurchaseReturns) {
        dispatch(getAllPurchaseReturns(commonParams));
      } else if (isSalesAggregate) {
        dispatch(
          getSalesReports({
            page,
            limit: paginationLimit,
            type: reportType,
            sortBy: "totalSales",
            sortOrder: "desc",
          }),
        );
      } else if (isPurchaseAggregate) {
        dispatch(
          getPurchaseReports({
            page,
            limit: paginationLimit,
            type: reportType,
            sortBy: "netPurchases",
            sortOrder: "desc",
          }),
        );
      } else if (isExpenseAggregate) {
        dispatch(
          getExpenseReports({
            page,
            limit: paginationLimit,
            type: "category",
          }),
        );
      } else if (isProductReport) {
        dispatch(
          getProductsReport({
            page,
            limit: paginationLimit,
            search: searchTerm.trim(),
            stockFilter: selectedReport === "low_stock" ? "low-stock" : "all",
          }),
        );
      } else if (isStockMovement) {
        dispatch(
          getStockMovementReports({
            page,
            limit: paginationLimit,
          }),
        );
      } else if (isPaymentReport) {
        dispatch(
          getPaymentReports({
            view: selectedReport,
            page,
            limit: paginationLimit,
            search: searchTerm.trim(),
          }),
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    settingsReady,
    selectedReport,
    reportType,
    isSales,
    isSalesReturns,
    isPurchase,
    isPurchaseReturns,
    isSalesAggregate,
    isPurchaseAggregate,
    isExpenseAggregate,
    isProductReport,
    isStockMovement,
    isPaymentReport,
    page,
    paginationLimit,
    searchTerm,
    period,
    startDate,
    endDate,
    setSearchParams,
    refreshKey,
  ]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const handleReportChange = (value) => {
    updateParams({ type: value, search: null, page: 1 });
  };

  useEffect(() => {
    if (page > pages) {
      updateParams({ page: pages });
    }
  }, [page, pages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages || loading) return;
    updateParams({ page: newPage });
  };

  const reportColumns = {
    sales: [
      { label: "Invoice", render: (item) => item.invoiceNumber || "-" },
      {
        label: "Date",
        render: (item) => formatDate(item.invoiceDate || item.createdAt),
      },
      { label: "Customer", render: (item) => item.customer?.name || "-" },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.grandTotal)}`,
        right: true,
      },
    ],
    sales_returns: [
      { label: "Return #", render: (item) => item.returnInvoiceNumber || "-" },
      { label: "Date", render: (item) => formatDate(item.returnDate) },
      {
        label: "Original invoice",
        render: (item) => item.originalSaleInvoiceNumber || "-",
      },
      { label: "Customer", render: (item) => item.customer?.name || "-" },
      {
        label: "Credit amount",
        render: (item) => `${currency} ${formatAmount(item.returnAmount)}`,
        right: true,
      },
    ],
    purchases: [
      { label: "Invoice", render: (item) => item.invoiceNumber || "-" },
      {
        label: "Date",
        render: (item) => formatDate(item.invoiceDate || item.createdAt),
      },
      { label: "Supplier", render: (item) => item.supplier?.name || "-" },
      {
        label: "Total purchase",
        render: (item) => `${currency} ${formatAmount(item.grandTotal)}`,
        right: true,
      },
    ],
    purchase_returns: [
      { label: "Return #", render: (item) => item.returnInvoiceNumber || "-" },
      { label: "Date", render: (item) => formatDate(item.returnDate) },
      {
        label: "Original invoice",
        render: (item) => item.originalPurchaseInvoiceNumber || "-",
      },
      {
        label: "Return amount",
        render: (item) => `${currency} ${formatAmount(item.returnAmount)}`,
        right: true,
      },
    ],
    daily: [
      { label: "Date", render: (item) => formatDate(item.date) },
      { label: "Total invoices", render: (item) => item.totalInvoices || 0 },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.totalSales)}`,
        right: true,
      },
    ],
    weekly: [
      { label: "Start date", render: (item) => formatDate(item.weekStart) },
      { label: "End date", render: (item) => formatDate(item.weekEnd) },
      { label: "Total invoices", render: (item) => item.totalInvoices || 0 },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.totalSales)}`,
        right: true,
      },
    ],
    monthly: [
      {
        label: "Month",
        render: (item) =>
          new Date(item.year, item.month - 1).toLocaleString("en-US", {
            month: "long",
          }),
      },
      { label: "Start date", render: (item) => formatDate(item.startDate) },
      { label: "End date", render: (item) => formatDate(item.endDate) },
      { label: "Total invoices", render: (item) => item.totalInvoices || 0 },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.totalSales)}`,
        right: true,
      },
    ],
    customer: [
      { label: "Customer", render: (item) => item.customer?.name || "-" },
      { label: "Total invoices", render: (item) => item.totalInvoices || 0 },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.netSales)}`,
        right: true,
      },
    ],
    product: [
      { label: "Product", render: (item) => item.product?.name || "-" },
      { label: "Total sold quantity", render: (item) => item.netQuantity || 0 },
      {
        label: "Total sold",
        render: (item) => `${currency} ${formatAmount(item.netSales)}`,
        right: true,
      },
    ],
    supplier: [
      { label: "Supplier", render: (item) => item.supplier?.name || "-" },
      { label: "Total invoices", render: (item) => item.totalInvoices || 0 },
      {
        label: "Total purchase",
        render: (item) => `${currency} ${formatAmount(item.netPurchases)}`,
        right: true,
      },
    ],
    purchaseProduct: [
      { label: "Product", render: (item) => item.product?.name || "-" },
      { label: "Quantity", render: (item) => item.netQuantity || 0 },
      {
        label: "Total purchases",
        render: (item) => `${currency} ${formatAmount(item.netPurchases)}`,
        right: true,
      },
    ],
    category: [
      { label: "Category Name", render: (item) => item?.category?.name || "-" },
      {
        label: "Total Expenses",
        render: (item) => `${currency} ${formatAmount(item.totalExpenses)}`,
        right: true,
      },
    ],
    stock: [
      { label: "Product Name", render: (item) => item.productName || "-" },
      { label: "SKU", render: (item) => item.sku || "-" },
      {
        label: "Current Stock",
        render: (item) =>
          Number(item.currentStock || 0).toLocaleString("en-PK"),
      },
      {
        label: "Unit Cost",
        render: (item) => `${currency} ${formatAmount(item.unitCost)}`,
        right: true,
      },
      {
        label: "Total Value",
        render: (item) => `${currency} ${formatAmount(item.totalValue)}`,
        right: true,
      },
    ],
    movements: [
      { label: "Product", render: (item) => item.productName || "-" },
      { label: "SKU", render: (item) => item.sku || "-" },
      {
        label: "Adjustment Type",
        render: (item) => item.adjustmentType || "-",
      },
      {
        label: "Quantity",
        render: (item) => Number(item.quantity || 0).toLocaleString("en-PK"),
      },
      {
        label: "Change",
        render: (item) => Number(item.change || 0).toLocaleString("en-PK"),
      },
      {
        label: "Stock After",
        render: (item) => Number(item.totoalAfter || 0).toLocaleString("en-PK"),
      },
      { label: "Reason", render: (item) => item.reason || "-" },
      { label: "Date", render: (item) => formatDate(item.date) },
    ],
    customerReceivables: [
      { label: "Customer Name", render: (item) => item.partyName || "-" },
      { label: "Contact Number", render: (item) => item.phone || "-" },
      {
        label: "Total Closing Receivables",
        render: (item) => `${currency} ${formatAmount(item.closingReceivable)}`,
        right: true,
      },
    ],
    supplierPayables: [
      { label: "Supplier Name", render: (item) => item.partyName || "-" },
      { label: "Contact Number", render: (item) => item.phone || "-" },
      {
        label: "Total Closing Payables",
        render: (item) => `${currency} ${formatAmount(item.closingPayable)}`,
        right: true,
      },
    ],
    customerPayments: [
      {
        label: "Date",
        render: (item) => formatDate(item.paymentDate),
      },
      { label: "Customer Name", render: (item) => item.partyName || "-" },
      {
        label: "Amount",
        render: (item) => `${currency} ${formatAmount(item.amount)}`,
        right: true,
      },
      {
        label: "Direction",
        render: (item) =>
          item.direction === "credit" ? "Received" : "Paid Out",
        right: true,
      },
      { label: "Method", render: (item) => item.paymentMethod || "-" },
      { label: "Ref", render: (item) => item.ref || "-" },
    ],
    supplierPayments: [
      {
        label: "Date",
        render: (item) => formatDate(item.paymentDate || item.date),
      },
      { label: "Supplier Name", render: (item) => item.partyName || "-" },
      {
        label: "Amount",
        render: (item) => `${currency} ${formatAmount(item.amount)}`,
        right: true,
      },
      {
        label: "Direction",
        render: (item) =>
          item.direction === "credit" ? "Received" : "Paid Out",
        right: true,
      },
      { label: "Method", render: (item) => item.paymentMethod || "-" },
      { label: "Ref", render: (item) => item.ref || "-" },
    ],
  };

  const columns = isPaymentReport
    ? reportColumns[selectedReport] || []
    : isStockMovement
      ? reportColumns.movements
      : isProductReport
        ? reportColumns.stock
        : isExpenseAggregate
          ? reportColumns.category
          : isAggregate && isPurchaseAggregate
            ? reportColumns[
                selectedReport === "supplier_purchases"
                  ? "supplier"
                  : "purchaseProduct"
              ]
            : isAggregate
              ? reportColumns[reportType] || []
              : reportColumns[selectedReport] || [];

  const handleExportCSV = () => {
    const rows = [
      columns.map((column) => column.label),
      ...data.map((item) =>
        columns.map(
          (column) =>
            `"${String(column.render(item) ?? "").replace(/"/g, '""')}"`,
        ),
      ),
    ];

    const blob = new Blob(
      ["\uFEFF" + rows.map((row) => row.join(",")).join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedReport}_Report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportTitle =
    selectedReport === "stock"
      ? "All Stock"
      : selectedReport === "low_stock"
        ? "Low Stock"
        : selectedOption?.label || "Business reports";

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Business reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Clear numbers for better decisions
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={!data.length}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-56">
              <select
                value={selectedReport}
                onChange={(e) => handleReportChange(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
              >
                {reportCategories.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search report"
                value={searchTerm}
                onChange={(e) =>
                  updateParams({ search: e.target.value, page: 1 })
                }
                className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
              />
            </div>

            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={loading || !settingsReady}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
            >
              {loading && <RefreshCw size={13} className="animate-spin" />}
              View report
            </button>
          </div>

          <div className="px-4 sm:px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">{reportTitle}</h2>
            <span className="text-[11px] text-slate-400">
              {totalRecords} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              {(loading || !settingsReady) && (
                <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
                  <RefreshCw size={22} className="animate-spin text-blue-600" />
                </div>
              )}

              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.label}
                        className={`px-5 py-3.5 whitespace-nowrap ${column.right ? "text-right" : ""}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.length ? (
                    data.map((item, index) => (
                      <tr
                        key={
                          item._id ||
                          item.invoiceNumber ||
                          item.returnInvoiceNumber ||
                          item.categoryName ||
                          item.partyId ||
                          item.supplier?._id ||
                          item.product?._id ||
                          item.sku ||
                          item.date ||
                          item.weekStart ||
                          index
                        }
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {columns.map((column) => (
                          <td
                            key={column.label}
                            className={`px-5 py-3.5 whitespace-nowrap ${column.right ? "text-right font-semibold text-slate-900 font-mono" : "text-slate-600"}`}
                          >
                            {column.render(item)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={Math.max(columns.length, 1)}
                        className="text-center py-16 text-slate-400 font-medium text-xs"
                      >
                        {!settingsReady
                          ? "Loading business settings..."
                          : loading
                            ? "Loading report..."
                            : "No report records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            totalItems={totalRecords || 0}
            startIndex={startIndex}
            currentItemsCount={data.length}
            currentPage={activePage}
            totalPages={pages}
            onPageChange={handlePageChange}
            loading={loading || !settingsReady}
          />
        </div>
      </div>
    </div>
  );
}
