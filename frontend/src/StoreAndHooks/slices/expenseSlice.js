import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getExpenses = createAsyncThunk(
  "expense/getExpenses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("expenses/list", {
        params: {
          ...params,
          ...(params.search ? { search: params.search } : {}),
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("expenses/add", formData);
      return response.data.expense;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getExpenseById = createAsyncThunk(
  "expense/getExpenseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`expenses/${id}`);
      return response.data.expense;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`expenses/update/${id}`, formData);
      return response.data.expense;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`expenses/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  expenses: [],
  currentExpense: null,
  currentPage: 1,
  totalPages: 1,
  totalExpenses: 0,
  queryParams: {
    page: 1,
    search: "",
    period: "",
    startDate: "",
    endDate: "",
  },
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearExpenseSuccess: (state) => {
      state.success = false;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    clearExpenseFilters: (state) => {
      state.queryParams = {
        page: 1,
        search: "",
        period: "",
        startDate: "",
        endDate: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data || [];
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.totalPages = Math.max(
          1,
          Number(action.payload.pagination?.totalPages) || 1,
        );
        state.totalExpenses = Number(action.payload.pagination?.total) || 0;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createExpense.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getExpenseById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(getExpenseById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentExpense = action.payload;
      })
      .addCase(getExpenseById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense,
        );
        state.currentExpense = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteExpense.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload,
        );
        state.totalExpenses = Math.max(0, state.totalExpenses - 1);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  clearExpenseError,
  clearExpenseSuccess,
  clearCurrentExpense,
  clearExpenseFilters,
} = expenseSlice.actions;

export default expenseSlice.reducer;
