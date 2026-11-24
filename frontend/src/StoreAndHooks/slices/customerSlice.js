import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data || {
      message: error.message || "Something went wrong",
    },
  );

export const registerCustomer = createAsyncThunk(
  "customers/registerCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post("customers/add-customer", customerData);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `customers/update-customer/${id}`,
        customerData,
      );
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getCustomerById = createAsyncThunk(
  "customers/getCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`customers/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`customers/delete/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getCustomerList = createAsyncThunk(
  "customers/getCustomerList",
  async (
    {
      page = 1,
      limit,
      search = "",
      status = "all",
      period,
      startDate,
      endDate,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get("customers/list", {
        params: {
          page,
          ...(limit && { limit }),
          search: search.trim(),
          status,
          ...(period && { period }),
          ...(period === "custom" && { startDate, endDate }),
        },
      });

      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

const initialState = {
  customers: [],
  selectedCustomer: null,
  pagination: {
    totalCustomers: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  success: false,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearCustomerSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const requests = [
      registerCustomer,
      updateCustomer,
      getCustomerById,
      deleteCustomer,
      getCustomerList,
    ];

    requests.forEach((request) => {
      builder
        .addCase(request.pending, (state) => {
          state.loading = true;
          state.error = null;

          if (
            request === registerCustomer ||
            request === updateCustomer ||
            request === deleteCustomer
          ) {
            state.success = false;
          }
        })
        .addCase(request.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload?.message || action.error.message || "Request failed";
        });
    });

    builder.addCase(registerCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedCustomer = action.payload.data ?? action.payload;
    });

    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedCustomer = action.payload.data ?? action.payload;
    });

    builder.addCase(getCustomerById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCustomer =
        action.payload.data?.customer ??
        action.payload.data ??
        action.payload.customer ??
        action.payload;
    });

    builder.addCase(deleteCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.customers = state.customers.filter(
        (customer) =>
          String(customer._id ?? customer.id) !== String(action.payload),
      );

      if (
        String(
          state.selectedCustomer?._id ?? state.selectedCustomer?.id ?? "",
        ) === String(action.payload)
      ) {
        state.selectedCustomer = null;
      }
    });

    builder.addCase(getCustomerList.fulfilled, (state, action) => {
      state.loading = false;
      const response = action.payload ?? {};
      const pagination = response.pagination ?? {};

      state.customers = Array.isArray(response.data) ? response.data : [];
      state.pagination = {
        totalCustomers: Number(pagination.totalCustomers ?? 0),
        totalPages: Number(pagination.totalPages ?? 0),
        currentPage: Number(pagination.currentPage ?? 1),
        limit: Number(pagination.limit ?? 10),
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPrevPage: Boolean(pagination.hasPrevPage),
      };
    });
  },
});

export const {
  clearCustomerError,
  clearSelectedCustomer,
  clearCustomerSuccess,
} = customerSlice.actions;

export default customerSlice.reducer;
