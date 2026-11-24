import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getAllPurchaseInvoices = createAsyncThunk(
  "purchaseInvoice/getAllPurchaseInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit,
        period,
        startDate,
        endDate,
        ...filters
      } = params;
      const { data } = await api.get("purchase-invoices/list", {
        params: {
          page,
          sortBy: "createdAt",
          sortOrder: "desc",
          ...filters,
          ...(limit && { limit }),
          ...(period && { period }),
          ...(period === "custom" && { startDate, endDate }),
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getAllPurchaseReturns = createAsyncThunk(
  "purchaseInvoice/getAllPurchaseReturns",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit,
        period,
        startDate,
        endDate,
        ...filters
      } = params;
      const { data } = await api.get("purchase-invoices/return-list", {
        params: {
          page,
          sortBy: "createdAt",
          sortOrder: "desc",
          ...filters,
          ...(limit && { limit }),
          ...(period && { period }),
          ...(period === "custom" && { startDate, endDate }),
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createPurchaseInvoice = createAsyncThunk(
  "purchaseInvoice/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("purchase-invoices/add", formData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getPurchaseInvoiceById = createAsyncThunk(
  "purchaseInvoice/getById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`purchase-invoices/invoiceDetails/${id}`);
      return data.invoice;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const returnPurchaseInvoice = createAsyncThunk(
  "purchaseInvoice/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `purchase-invoices/return/${id}`,
        formData,
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const purchaseInvoiceSlice = createSlice({
  name: "purchaseInvoice",
  initialState: {
    invoices: [],
    returns: [],
    currentInvoice: null,
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
    clearPurchaseInvoiceError: (state) => {
      state.error = null;
    },
    clearCurrentPurchaseInvoice: (state) => {
      state.currentInvoice = null;
      state.detailsLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPurchaseInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPurchaseInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data || [];
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.totalInvoices = action.payload.pagination?.totalInvoices || 0;
      })
      .addCase(getAllPurchaseInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(getAllPurchaseReturns.pending, (state) => {
        state.returnsLoading = true;
        state.error = null;
      })
      .addCase(getAllPurchaseReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.returns = action.payload.data || [];
        state.returnsCurrentPage = action.payload.pagination?.currentPage || 1;
        state.returnsTotalPages = action.payload.pagination?.totalPages || 1;
        state.totalReturns = action.payload.pagination?.totalReturns || 0;
      })
      .addCase(getAllPurchaseReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(createPurchaseInvoice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createPurchaseInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.invoices.unshift(action.payload);
          state.totalInvoices += 1;
        }
      })
      .addCase(createPurchaseInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(getPurchaseInvoiceById.pending, (state) => {
        state.detailsLoading = true;
        state.currentInvoice = null;
      })
      .addCase(getPurchaseInvoiceById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(getPurchaseInvoiceById.rejected, (state) => {
        state.detailsLoading = false;
        state.currentInvoice = null;
      })

      .addCase(returnPurchaseInvoice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(returnPurchaseInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentInvoice = action.payload;

        const index = state.invoices.findIndex(
          (invoice) => invoice._id === action.payload?._id,
        );

        if (index !== -1) state.invoices[index] = action.payload;
      })
      .addCase(returnPurchaseInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearPurchaseInvoiceError, clearCurrentPurchaseInvoice } =
  purchaseInvoiceSlice.actions;

export default purchaseInvoiceSlice.reducer;
