import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const initialPagination = {
  currentPage: 1,
  limit: 10,
  totalRecords: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export const getSalesReports = createAsyncThunk(
  "reports/getSalesReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/sales-reports", {
        params: {
          type: "daily",
          page: 1,
          limit: 10,
          sortBy: "totalSales",
          sortOrder: "desc",
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sales reports",
      );
    }
  },
);

export const getPurchaseReports = createAsyncThunk(
  "reports/getPurchaseReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/purchase-reports", {
        params: {
          type: "supplier",
          page: 1,
          limit: 10,
          sortBy: "netPurchases",
          sortOrder: "desc",
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase reports",
      );
    }
  },
);

export const getExpenseReports = createAsyncThunk(
  "reports/getExpenseReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/expense-reports", {
        params: {
          type: "category",
          page: 1,
          limit: 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expense reports",
      );
    }
  },
);

export const getProductsReport = createAsyncThunk(
  "reports/getProductsReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/products-reports", {
        params: {
          stockFilter: "all",
          page: 1,
          limit: 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products report",
      );
    }
  },
);

export const getStockMovementReports = createAsyncThunk(
  "reports/getStockMovementReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/stockmovement-reports", {
        params: {
          page: 1,
          limit: 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch stock movement reports",
      );
    }
  },
);

export const getPaymentReports = createAsyncThunk(
  "reports/getPaymentReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/payment-reports", {
        params: {
          view: "all",
          partyType: "all",
          search: "",
          page: 1,
          limit: 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment reports",
      );
    }
  },
);

const createReportState = () => ({
  data: [],
  summary: {},
  reportType: null,
  pagination: { ...initialPagination },
  loading: false,
  error: null,
});

const initialState = {
  sales: createReportState(),
  purchases: createReportState(),
  expenses: createReportState(),
  products: createReportState(),
  stockMovements: createReportState(),
  paymentReports: createReportState(),
  filters: {
    sales: {
      type: "daily",
      page: 1,
      limit: 10,
      sortBy: "totalSales",
      sortOrder: "desc",
    },
    purchases: {
      type: "supplier",
      page: 1,
      limit: 10,
      sortBy: "netPurchases",
      sortOrder: "desc",
    },
    expenses: { type: "category", page: 1, limit: 10 },
    products: {
      stockFilter: "all",
      search: "",
      page: 1,
      limit: 10,
    },
    stockMovements: {
      page: 1,
      limit: 10,
    },
    paymentReports: {
      view: "all",
      partyType: "all",
      search: "",
      page: 1,
      limit: 10,
      period: "all",
    },
  },
};

const updateFulfilled = (state, action) => {
  state.loading = false;
  state.data = action.payload.data || [];
  state.summary = action.payload.summary || {};
  state.reportType = action.payload.reportType || null;

  const pagination = action.payload.pagination || {};

  state.pagination = {
    ...initialPagination,
    ...pagination,
    currentPage: pagination.currentPage ?? pagination.page ?? 1,
    totalRecords:
      pagination.totalRecords ??
      pagination.totalProducts ??
      pagination.totalHistory ??
      pagination.total ??
      0,
  };
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReportFilters: (state, action) => {
      state.filters.sales = { ...state.filters.sales, ...action.payload };
    },
    setPurchaseReportFilters: (state, action) => {
      state.filters.purchases = {
        ...state.filters.purchases,
        ...action.payload,
      };
    },
    setExpenseReportFilters: (state, action) => {
      state.filters.expenses = { ...state.filters.expenses, ...action.payload };
    },
    setProductReportFilters: (state, action) => {
      state.filters.products = { ...state.filters.products, ...action.payload };
    },
    setStockMovementFilters: (state, action) => {
      state.filters.stockMovements = {
        ...state.filters.stockMovements,
        ...action.payload,
      };
    },
    setPaymentReportFilters: (state, action) => {
      state.filters.paymentReports = {
        ...state.filters.paymentReports,
        ...action.payload,
      };
    },
    resetReportFilters: (state) => {
      state.filters.sales = { ...initialState.filters.sales };
      state.sales = createReportState();
    },
    resetPurchaseReportFilters: (state) => {
      state.filters.purchases = { ...initialState.filters.purchases };
      state.purchases = createReportState();
    },
    resetExpenseReportFilters: (state) => {
      state.filters.expenses = { ...initialState.filters.expenses };
      state.expenses = createReportState();
    },
    resetProductReportFilters: (state) => {
      state.filters.products = { ...initialState.filters.products };
      state.products = createReportState();
    },
    resetStockMovementFilters: (state) => {
      state.filters.stockMovements = {
        ...initialState.filters.stockMovements,
      };
      state.stockMovements = createReportState();
    },
    resetPaymentReportFilters: (state) => {
      state.filters.paymentReports = {
        ...initialState.filters.paymentReports,
      };
      state.paymentReports = createReportState();
    },
    clearSalesReports: (state) => {
      state.sales = createReportState();
    },
    clearPurchaseReports: (state) => {
      state.purchases = createReportState();
    },
    clearExpenseReports: (state) => {
      state.expenses = createReportState();
    },
    clearProductReports: (state) => {
      state.products = createReportState();
    },
    clearStockMovementReports: (state) => {
      state.stockMovements = createReportState();
    },
    clearPaymentReports: (state) => {
      state.paymentReports = createReportState();
    },
  },
  extraReducers: (builder) => {
    const addCases = (thunk, key) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[key].loading = true;
          state[key].error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          updateFulfilled(state[key], action);
        })
        .addCase(thunk.rejected, (state, action) => {
          state[key].loading = false;
          state[key].error = action.payload || "Something went wrong";
        });
    };

    addCases(getSalesReports, "sales");
    addCases(getPurchaseReports, "purchases");
    addCases(getExpenseReports, "expenses");
    addCases(getProductsReport, "products");
    addCases(getStockMovementReports, "stockMovements");
    addCases(getPaymentReports, "paymentReports");
  },
});

export const {
  setReportFilters,
  setPurchaseReportFilters,
  setExpenseReportFilters,
  setProductReportFilters,
  setStockMovementFilters,
  setPaymentReportFilters,
  resetReportFilters,
  resetPurchaseReportFilters,
  resetExpenseReportFilters,
  resetProductReportFilters,
  resetStockMovementFilters,
  resetPaymentReportFilters,
  clearSalesReports,
  clearPurchaseReports,
  clearExpenseReports,
  clearProductReports,
  clearStockMovementReports,
  clearPaymentReports,
} = reportSlice.actions;

export const reportReducer = reportSlice.reducer;
export const salesReportReducer = reportSlice.reducer;
export const purchaseReportReducer = reportSlice.reducer;

export default reportSlice.reducer;
