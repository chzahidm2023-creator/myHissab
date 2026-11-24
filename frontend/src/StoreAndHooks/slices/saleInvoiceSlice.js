import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const getSettingsParams = (getState, params = {}) => {
  const preferences =
    getState()?.businessSettings?.settings?.systemPreferences || {};

  const {
    startDate: customStartDate,
    endDate: customEndDate,
    ...otherParams
  } = params;

  const period = String(
    params.period ?? preferences.defaultPeriod ?? "all",
  ).toLowerCase();

  const requestParams = {
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...otherParams,
    period,
  };

  if (params.limit) {
    requestParams.limit = params.limit;
  } else if (preferences.paginationLimit) {
    requestParams.limit = Number(preferences.paginationLimit) || 10;
  }

  if (period === "custom") {
    const startDate =
      customStartDate ??
      (preferences.customStartDate
        ? String(preferences.customStartDate).slice(0, 10)
        : "");
    const endDate =
      customEndDate ??
      (preferences.customEndDate
        ? String(preferences.customEndDate).slice(0, 10)
        : "");

    if (startDate) requestParams.startDate = startDate;
    if (endDate) requestParams.endDate = endDate;
  }

  return requestParams;
};

export const getAllSaleInvoices = createAsyncThunk(
  "saleInvoice/getAll",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.get("sale-invoices/list", {
        params: getSettingsParams(getState, params),
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getAllSaleReturns = createAsyncThunk(
  "saleInvoice/getAllReturns",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.get("sale-invoices/return-list", {
        params: getSettingsParams(getState, params),
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getSaleInvoiceById = createAsyncThunk(
  "saleInvoice/getById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `sale-invoices/invoiceDetails/${invoiceId}`,
      );
      return data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createSaleInvoice = createAsyncThunk(
  "saleInvoice/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("sale-invoices/add", formData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createSaleReturn = createAsyncThunk(
  "saleInvoice/createReturn",
  async (returnData, { rejectWithValue }) => {
    try {
      const { invoiceId, ...formData } = returnData;
      const { data } = await api.put(
        `sale-invoices/return/${invoiceId}`,
        formData,
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const saleInvoiceSlice = createSlice({
  name: "saleInvoice",
  initialState: {
    invoices: [],
    returns: [],
    selectedInvoice: null,
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    returnsCurrentPage: 1,
    returnsTotalPages: 1,
    totalReturns: 0,
    loading: false,
    returnsLoading: false,
    detailsLoading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearSaleInvoiceError: (state) => {
      state.error = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
      state.detailsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSaleInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSaleInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data || [];
        const pagination = action.payload.pagination || {};
        state.totalInvoices =
          pagination.totalInvoices ?? action.payload.totalInvoices ?? 0;
        state.totalPages =
          pagination.totalPages ?? action.payload.totalPages ?? 1;
        state.currentPage =
          pagination.currentPage ?? action.payload.currentPage ?? 1;
      })
      .addCase(getAllSaleInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getAllSaleReturns.pending, (state) => {
        state.returnsLoading = true;
        state.error = null;
      })
      .addCase(getAllSaleReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.returns = action.payload.data || [];
        state.returnsCurrentPage = action.payload.currentPage || 1;
        state.returnsTotalPages = action.payload.totalPages || 1;
        state.totalReturns = action.payload.totalReturns || 0;
      })
      .addCase(getAllSaleReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getSaleInvoiceById.pending, (state) => {
        state.detailsLoading = true;
        state.selectedInvoice = null;
      })
      .addCase(getSaleInvoiceById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(getSaleInvoiceById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createSaleInvoice.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createSaleInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.invoices.unshift(action.payload);
        state.totalInvoices += 1;
      })
      .addCase(createSaleInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createSaleReturn.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createSaleReturn.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createSaleReturn.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSaleInvoiceError, clearSelectedInvoice } =
  saleInvoiceSlice.actions;

export default saleInvoiceSlice.reducer;
