import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Tag,
  Users,
  ShoppingCart,
  Plus,
  ShoppingBag,
  Download,
  ChartSpline,
  HandCoins,
  SquareMinus,
  CalendarDays,
  ChevronDown,
  X,
  Package2,
  Van,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSalesReports,
  getPurchaseReports,
  getExpenseReports,
} from "../../../StoreAndHooks/slices/reportSlice";
import { getProducts } from "../../../StoreAndHooks/slices/productSlice";
import { getSupplierList } from "../../../StoreAndHooks/slices/supplierSlice";
import { getCustomerList } from "../../../StoreAndHooks/slices/customerSlice";
import { getAllSaleInvoices } from "../../../StoreAndHooks/slices/saleInvoiceSlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";

const dateOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last-7-days" },
  { label: "Last 15 Days", value: "last-15-days" },
  { label: "Last 30 Days", value: "last-30-days" },
  { label: "Last 60 Days", value: "last-60-days" },
  { label: "Last 90 Days", value: "last-90-days" },
  { label: "Last 6 Months", value: "last-6-months" },
  { label: "Last 1 Year", value: "last-1-year" },
  { label: "Custom Date Range", value: "custom" },
  { label: "All Data", value: "all" },
];

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });

const dateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRange = (period) => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (period === "all") {
    return { startDate: "", endDate: "" };
  }

  if (period === "today") {
    return {
      startDate: dateToString(start),
      endDate: dateToString(end),
    };
  }

  if (period === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  }

  const days = {
    "last-7-days": 7,
    "last-15-days": 15,
    "last-30-days": 30,
    "last-60-days": 60,
    "last-90-days": 90,
  };

  if (days[period]) {
    start.setDate(start.getDate() - days[period] + 1);
  }

  if (period === "last-6-months") {
    start.setMonth(start.getMonth() - 6);
  }

  if (period === "last-1-year") {
    start.setFullYear(start.getFullYear() - 1);
  }

  return {
    startDate: dateToString(start),
    endDate: dateToString(end),
  };
};

const getRecordDate = (item, type) => {
  if (type === "weekly") {
    return (
      item.weekStart ||
      item.periodStartDate ||
      item.startDate ||
      item.period ||
      item.date
    );
  }

  if (type === "monthly") {
    return (
      item.monthStartDate ||
      item.periodStartDate ||
      item.startDate ||
      item.period ||
      item.date
    );
  }

  return (
    item.periodStartDate ||
    item.date ||
    item.period ||
    item.startDate ||
    item.createdAt
  );
};

const getRecordAmount = (item, reportType) => {
  if (reportType === "sales") {
    return Number(item.totalSales ?? item.netSales ?? 0);
  }

  if (reportType === "purchases") {
    return Number(
      item.netPurchases ?? item.totalPurchases ?? item.totalPurchase ?? 0,
    );
  }

  return Number(item.totalExpenses ?? 0);
};

const getChartData = (sales, purchases, expenses, type) => {
  const grouped = {};

  const addRecords = (records, reportType) => {
    if (!Array.isArray(records)) return;

    records.forEach((item) => {
      const date = getRecordDate(item, type);

      if (!date) return;

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) return;

      const key = dateToString(parsedDate);

      if (!grouped[key]) {
        grouped[key] = {
          key,
          sales: 0,
          purchases: 0,
          expenses: 0,
        };
      }

      grouped[key][reportType] += getRecordAmount(item, reportType);
    });
  };

  addRecords(sales, "sales");
  addRecords(purchases, "purchases");
  addRecords(expenses, "expenses");

  return Object.values(grouped)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => ({
      ...item,
      revenue: item.sales - item.purchases - item.expenses,
    }));
};

const formatDateLabel = (date) => {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const formatAxisValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}m`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return String(Math.round(value));
};

const createSmoothPath = (points) => {
  if (!points.length) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;

    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
};

function BusinessChart({ data }) {
  const width = 620;
  const height = 230;
  const left = 48;
  const right = 12;
  const top = 15;
  const bottom = 40;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.sales, item.purchases, item.expenses]),
  );

  const axisMax = Math.ceil(maxValue / 5) * 5 || 5;

  const getX = (index) =>
    data.length === 1
      ? left + chartWidth / 2
      : left + (index / (data.length - 1)) * chartWidth;

  const getY = (value) => top + chartHeight - (value / axisMax) * chartHeight;

  const series = [
    { key: "sales", label: "Sales", color: "#259B75" },
    { key: "purchases", label: "Purchases", color: "#94A3B8" },
    { key: "expenses", label: "Expenses", color: "#E7B36D" },
  ];

  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const value = (axisMax / 4) * (4 - index);

    return {
      value,
      y: getY(value),
    };
  });

  const labelIndexes =
    data.length <= 6
      ? data.map((_, index) => index)
      : Array.from(
          new Set(
            Array.from({ length: 6 }, (_, index) =>
              Math.round((index / 5) * (data.length - 1)),
            ),
          ),
        );

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Sales, purchases and expenses performance chart"
      >
        {gridLines.map((line, index) => (
          <g key={index}>
            <line
              x1={left}
              y1={line.y}
              x2={width - right}
              y2={line.y}
              stroke="#EDF1F5"
              strokeDasharray="4 4"
            />
            <text
              x={left - 8}
              y={line.y + 3}
              fill="#94A3B8"
              fontSize="9"
              textAnchor="end"
            >
              {formatAxisValue(line.value)}
            </text>
          </g>
        ))}

        {series.map((item) => {
          const points = data.map((record, index) => ({
            x: getX(index),
            y: getY(record[item.key]),
            value: record[item.key],
            date: record.key,
          }));

          return (
            <g key={item.key}>
              <path
                d={createSmoothPath(points)}
                fill="none"
                stroke={item.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={item.color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <title>
                    {`${item.label}: PKR ${formatAmount(point.value)} (${point.date})`}
                  </title>
                </g>
              ))}
            </g>
          );
        })}

        {labelIndexes.map((index) => (
          <text
            key={index}
            x={getX(index)}
            y={top + chartHeight + 23}
            fill="#94A3B8"
            fontSize="10"
            textAnchor="middle"
          >
            {formatDateLabel(data[index].key)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 pt-1">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] font-medium text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistogramChart({ data }) {
  const width = 340;
  const height = 230;
  const left = 12;
  const right = 12;
  const top = 15;
  const bottom = 40;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const series = [
    { key: "sales", label: "Sales", color: "#259B75" },
    { key: "purchases", label: "Purchase", color: "#94A3B8" },
    { key: "expenses", label: "Expenses", color: "#E7B36D" },
  ];

  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => series.map((seriesItem) => item[seriesItem.key])),
  );

  const axisMax = Math.ceil(maxValue / 5) * 5 || 5;

  const groupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(9, groupWidth / 5);

  const labelIndexes =
    data.length <= 5
      ? data.map((_, index) => index)
      : Array.from(
          new Set(
            Array.from({ length: 5 }, (_, index) =>
              Math.round((index / 4) * (data.length - 1)),
            ),
          ),
        );

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Sales, purchases and expenses histogram"
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const y = top + (chartHeight / 4) * index;

          return (
            <line
              key={index}
              x1={left}
              y1={y}
              x2={width - right}
              y2={y}
              stroke="#EDF1F5"
              strokeDasharray="4 4"
            />
          );
        })}

        {data.map((item, index) => {
          const centerX = left + groupWidth * (index + 0.5);

          return (
            <g key={item.key}>
              {series.map((seriesItem, seriesIndex) => {
                const value = item[seriesItem.key];
                const barHeight = (value / axisMax) * chartHeight;

                const x =
                  centerX + (seriesIndex - 1) * (barWidth + 2) - barWidth / 2;

                const y = top + chartHeight - barHeight;

                return (
                  <g key={seriesItem.key}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 0)}
                      rx="3"
                      fill={seriesItem.color}
                      opacity="0.9"
                    />
                    <title>
                      {`${seriesItem.label}: PKR ${formatAmount(value)} (${item.key})`}
                    </title>
                  </g>
                );
              })}
            </g>
          );
        })}

        {labelIndexes.map((index) => (
          <text
            key={index}
            x={left + groupWidth * (index + 0.5)}
            y={top + chartHeight + 23}
            fill="#94A3B8"
            fontSize="9"
            textAnchor="middle"
          >
            {formatDateLabel(data[index].key)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-1">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Overview() {
  const dispatch = useDispatch();
  const formatDate = useDateFormat();
  const reportState = useSelector((state) => state.reports || {});
  const salesReport = reportState.sales || {};
  const purchaseReport = reportState.purchases || {};
  const expenseReport = reportState.expenses || {};
  const salesSummary = salesReport.summary || {};
  const purchaseSummary = purchaseReport.summary || {};
  const expenseSummary = expenseReport.summary || {};
  const totalSale = Number(
    salesSummary.totalSales ?? salesSummary.netSales ?? 0,
  );
  const totalPurchase = Number(
    purchaseSummary.netPurchases ?? purchaseSummary.totalPurchases ?? 0,
  );
  const totalExpenses = Number(expenseSummary.totalExpenses || 0);
  const netRevenue = totalSale - totalPurchase - totalExpenses;
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [performanceType, setPerformanceType] = useState("daily");
  const [dateRange, setDateRange] = useState(() =>
    getDateRange("last-30-days"),
  );

  const { customers = [] } = useSelector((state) => state.customers || {});
  const { suppliers = [] } = useSelector((state) => state.suppliers || {});
  const totalSupplier = suppliers.length;
  const totalCustomers = customers?.length;
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  useEffect(() => {
    dispatch(getProducts({}))
      .unwrap()
      .then((res) => {
        setTotalProducts(res.data?.length || 0);
      });

    dispatch(getProducts({ stockFilter: "low-stock" }))
      .unwrap()
      .then((res) => {
        setLowStock(res.data?.length || 0);
      });
  }, [dispatch]);
  const recordCount = [
    {
      title: "Total Products",
      value: totalProducts,
      change: "current",
      icon: <Package2 className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Low Stock Product",
      value: lowStock,
      change: "current",
      icon: <SquareMinus className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: "Customers",
      value: totalCustomers,
      change: "period",
      icon: <Users className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Suppliers",
      value: totalSupplier,
      change: "total",
      icon: <Van className="h-6 w-6 text-rose-600" />,
    },
  ];

  const [draftPeriod, setDraftPeriod] = useState("last-30-days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const { invoices = [] } = useSelector((state) => state.saleInvoice || {});

  useEffect(() => {
    dispatch(getAllSaleInvoices());
    dispatch(getProducts({ stockFilter: "low-stock" }));
    dispatch(getCustomerList());
    dispatch(getSupplierList());
  }, [dispatch]);
  useEffect(() => {
    const params = {
      period: selectedPeriod,
      page: 1,
      limit: "all",
      sortOrder: "asc",
      ...(dateRange.startDate && { startDate: dateRange.startDate }),
      ...(dateRange.endDate && { endDate: dateRange.endDate }),
    };

    dispatch(getSalesReports({ ...params, type: performanceType }));
    dispatch(getPurchaseReports(params));
    dispatch(getExpenseReports({ ...params, type: performanceType }));
  }, [dispatch, dateRange, selectedPeriod, performanceType]);

  const handleOpenDateModal = () => {
    setDraftPeriod(selectedPeriod);
    setShowDateModal(true);
  };

  const handleApplyDate = () => {
    if (draftPeriod === "custom") {
      if (!customStart || !customEnd || customStart > customEnd) {
        return;
      }

      setDateRange({
        startDate: customStart,
        endDate: customEnd,
      });
    } else {
      setDateRange(getDateRange(draftPeriod));
    }

    setSelectedPeriod(draftPeriod);
    setShowDateModal(false);
  };

  const selectedDateLabel =
    dateOptions.find((item) => item.value === selectedPeriod)?.label ||
    "Last 30 Days";

  const chartData = useMemo(
    () =>
      getChartData(
        salesReport.data,
        purchaseReport.data,
        expenseReport.data,
        performanceType,
      ),
    [
      salesReport.data,
      purchaseReport.data,
      expenseReport.data,
      performanceType,
    ],
  );

  const statsData = [
    {
      title: "Total Sale",
      value: formatAmount(totalSale),
      change: "Within selected period",
      icon: <Package2 className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Total Purchase",
      value: formatAmount(totalPurchase),
      change: "Within selected period",
      icon: <ShoppingBag className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: "Total Expenses",
      value: formatAmount(totalExpenses),
      change: "Within selected period",
      icon: <HandCoins className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Net Revenue",
      value: formatAmount(netRevenue),
      change: "Sale - Purchase - Expenses",
      icon: <ChartSpline className="h-6 w-6 text-rose-600" />,
    },
  ];

  const isLoading =
    salesReport.loading || purchaseReport.loading || expenseReport.loading;
  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settings.businessDetails || {};
  const invoicePreferences = settings.invoicePreferences || {};
  const currency = business.currency || "PKR";
  return (
    <div className="flex-1 bg-slate-50/70 font-sans text-slate-800 sm:p-2 lg:p-3">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="mt-1 text-sm text-slate-500">
            YOUR BUSINESS AT A GLANCE
          </p>
          <h3 className="text-xl font-bold text-slate-900">
            Business Overview
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, Business. Here’s how your business is doing.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <button className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
          <button className="flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </button>
        </div>
      </div>

      <div className="mb-3 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Financial Overview
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {dateRange.startDate || "All dates"}{" "}
            {dateRange.endDate && `— ${dateRange.endDate}`}
          </p>
        </div>

        <button
          onClick={handleOpenDateModal}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
        >
          <CalendarDays className="h-4 w-4 text-blue-600" />
          Change Period
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {showDateModal && (
        <div
          className="fixed inset-0  flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onClick={() => setShowDateModal(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select Date Period
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Apply date filter across business reports
                </p>
              </div>
              <button
                onClick={() => setShowDateModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Date Range
              </label>

              <div className="relative">
                <select
                  value={draftPeriod}
                  onChange={(e) => setDraftPeriod(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {dateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-slate-500" />
              </div>

              {draftPeriod === "custom" && (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      max={customEnd || undefined}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart || undefined}
                      max={dateToString(new Date())}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {draftPeriod === "all" && (
                <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
                  All available business records will be included.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowDateModal(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                disabled={
                  draftPeriod === "custom" &&
                  (!customStart || !customEnd || customStart > customEnd)
                }
                onClick={handleApplyDate}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply Across Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                {stat.icon}
              </div>
              <h4 className="mt-6 flex items-baseline gap-1.5 text-3xl text-slate-900">
                <span className="text-sm font-normal text-slate-400">
                  {currency}
                </span>
                {stat.value}
              </h4>
              <p className="mt-3 text-xs text-slate-400/80">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Business Performance
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Financial trends and transaction comparison
            </p>
          </div>

          <div className="relative">
            <select
              value={performanceType}
              onChange={(e) => setPerformanceType(e.target.value)}
              className="w-32 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {isLoading && chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center">
            <ChartSpline className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-500">
              No performance data available
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Select another date period
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/40 p-2 lg:col-span-8">
              <div className="mb-2 px-2">
                <h3 className="text-xs font-bold text-slate-700">
                  Performance Trend
                </h3>
                <p className="text-[10px] text-slate-400">
                  Sales, purchases and expenses
                </p>
              </div>

              <BusinessChart data={chartData} />
            </div>

            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/40 p-2 lg:col-span-4">
              <div className="mb-2 px-2">
                <h3 className="text-xs font-bold text-slate-700">
                  Financial Histogram
                </h3>
                <p className="text-[10px] text-slate-400">
                  Transaction volume comparison
                </p>
              </div>

              <HistogramChart data={chartData} />
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {recordCount.map((stat, index) => (
          <div
            key={index + 1}
            className="flex min-h-[96px] items-center justify-between rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="mt-0.5 text-xl text-slate-400">{stat.icon}</div>
              <div>
                <h4 className="text-2xl font-semibold leading-none tracking-tight text-slate-800">
                  {stat.value}
                </h4>
                <p className="mt-2 whitespace-nowrap text-[11px] font-normal tracking-wide text-slate-400">
                  {stat.title}
                </p>
              </div>
            </div>
            <div className="select-none pt-1 text-[10px] font-normal text-slate-400/80">
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Sales</h2>
            <button className="text-sm font-bold text-blue-600 transition hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="whitespace-nowrap px-2 py-3">Invoices</th>
                  <th className="whitespace-nowrap px-4 py-3">Customers</th>
                  <th className="whitespace-nowrap px-4 py-3">Date</th>
                  <th className="whitespace-nowrap px-4 py-3">Price</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.map((invoice, index) => {
                  const status =
                    invoice.paymentStatus === "paid"
                      ? "Paid"
                      : invoice.paymentStatus === "partial"
                        ? "Partial"
                        : "Unpaid";
                  return (
                    <tr
                      key={index + 1}
                      className="transition hover:bg-slate-50/50"
                    >
                      <td className="whitespace-nowrap px-2 py-3">
                        <NavLink>{invoice.invoiceNumber}</NavLink>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                        {invoice.customer?.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${invoice.categoryBg}`}
                        >
                          {formatDate(invoice.invoiceDate || invoice.createdAt)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3  text-slate-900">
                        {currency}{" "}
                        {Number(invoice.grandTotal || 0).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${
                            status === "Paid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : status === "Partial"
                                ? "border-amber-200 bg-amber-50 text-amber-600"
                                : "border-rose-200 bg-rose-50 text-rose-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Showing 1-5 of 24 entries
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button className="group flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-4 transition hover:bg-blue-100/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-110">
                  <Box className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-800">
                  Add Product
                </span>
              </button>

              <button className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 transition hover:bg-emerald-100/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-110">
                  <Tag className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-800">
                  Add Category
                </span>
              </button>

              <button className="group flex flex-col items-center justify-center rounded-2xl border border-purple-100 bg-purple-50/50 p-4 transition hover:bg-purple-100/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20 transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-800">
                  Add User
                </span>
              </button>

              <button className="group flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 p-4 transition hover:bg-rose-100/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-500/20 transition-transform group-hover:scale-110">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-slate-800">
                  View All Orders
                </span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-600 p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">
                  Your Store Is Running Smoothly!
                </h3>
                <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-blue-100">
                  Everything looks good. Keep up the great work!
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
