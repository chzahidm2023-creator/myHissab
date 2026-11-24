import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Something went wrong",
  );

export const getCustomerLedger = createAsyncThunk(
  "ledger/getCustomerLedger",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`payments/${id}/ledger`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getSupplierLedger = createAsyncThunk(
  "ledger/getSupplierLedger",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`payments/${id}/ledgerSupplier`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const addPartyPayment = createAsyncThunk(
  "ledger/addPartyPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("payments/add-payments", data);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getAllTransactions = createAsyncThunk(
  "ledger/getAllTransactions",
  async (
    {
      page,
      limit,
      search = "",
      partyType = "all",
      period,
      startDate,
      endDate,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = {
        search: search.trim(),
        partyType: String(partyType || "all").toLowerCase(),
      };

      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      if (period) params.period = period;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("payments/all-payments", { params });
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

const initialState = {
  ledger: [],
  transactions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  paymentLoading: false,
  error: null,
};

const ledgerSlice = createSlice({
  name: "ledger",
  initialState,

  reducers: {
    clearLedgerError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getCustomerLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload.data || [];
      })
      .addCase(getCustomerLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(getSupplierLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSupplierLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload.data || [];
      })
      .addCase(getSupplierLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(addPartyPayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(addPartyPayment.fulfilled, (state) => {
        state.paymentLoading = false;
      })
      .addCase(addPartyPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(getAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data || [];
        const pagination = action.payload.pagination || {};
        state.pagination = {
          page: Number(pagination.page ?? 1),
          limit: Number(pagination.limit ?? 10),
          total: Number(pagination.total ?? 0),
          totalPages: Number(pagination.totalPages ?? 0),
          hasNextPage: pagination.hasNextPage ?? false,
          hasPrevPage: pagination.hasPrevPage ?? false,
        };
      })
      .addCase(getAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearLedgerError } = ledgerSlice.actions;

export default ledgerSlice.reducer;
