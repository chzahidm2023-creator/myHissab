import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data || {
      message: error.message || "Something went wrong",
    },
  );

const getSupplierData = (response) =>
  response?.data ?? response?.supplier ?? response;

export const registerSupplier = createAsyncThunk(
  "supplier/register",
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await api.post("suppliers/add-supplier", supplierData);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateSupplier = createAsyncThunk(
  "supplier/update",
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `suppliers/update-supplier/${id}`,
        supplierData,
      );
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getSupplierById = createAsyncThunk(
  "supplier/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`suppliers/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteSupplier = createAsyncThunk(
  "supplier/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`suppliers/delete/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getSupplierList = createAsyncThunk(
  "supplier/getList",
  async (
    { page = 1, limit = 10, search = "", status = "all", period = "all" } = {},
    { rejectWithValue },
  ) => {
    try {
      const normalizedStatus = String(status || "all")
        .trim()
        .toLowerCase();
      const validStatus = ["all", "active", "inactive"].includes(
        normalizedStatus,
      )
        ? normalizedStatus
        : "all";

      const response = await api.get("suppliers/list", {
        params: {
          page,
          limit,
          search: search.trim(),
          status: validStatus,
          period,
        },
      });

      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

const initialState = {
  suppliers: [],
  selectedSupplier: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  success: false,
};

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    clearSupplierError: (state) => {
      state.error = null;
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
    clearSupplierSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const requests = [
      registerSupplier,
      updateSupplier,
      getSupplierById,
      deleteSupplier,
      getSupplierList,
    ];

    requests.forEach((request) => {
      builder
        .addCase(request.pending, (state) => {
          state.loading = true;
          state.error = null;

          if (
            request === registerSupplier ||
            request === updateSupplier ||
            request === deleteSupplier
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

    builder.addCase(registerSupplier.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedSupplier = getSupplierData(action.payload);
    });

    builder.addCase(updateSupplier.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedSupplier = getSupplierData(action.payload);
    });

    builder.addCase(getSupplierById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedSupplier = getSupplierData(action.payload);
    });

    builder.addCase(deleteSupplier.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      const deletedId = String(action.payload);

      state.suppliers = state.suppliers.filter(
        (supplier) => String(supplier._id ?? supplier.id) !== deletedId,
      );

      if (
        String(
          state.selectedSupplier?._id ?? state.selectedSupplier?.id ?? "",
        ) === deletedId
      ) {
        state.selectedSupplier = null;
      }
    });

    builder.addCase(getSupplierList.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload ?? {};
      const suppliers = payload.data;

      state.suppliers = Array.isArray(suppliers)
        ? suppliers
        : (payload.suppliers ?? payload.items ?? payload.results ?? []);

      const pagination = payload.pagination ?? {};

      state.pagination = {
        page: Number(pagination.currentPage ?? pagination.page ?? 1),
        limit: Number(pagination.limit ?? 10),
        total: Number(
          pagination.totalSuppliers ??
            pagination.total ??
            payload.total ??
            payload.count ??
            0,
        ),
        totalPages: Number(pagination.totalPages ?? 0),
      };
    });
  },
});

export const {
  clearSupplierError,
  clearSelectedSupplier,
  clearSupplierSuccess,
} = supplierSlice.actions;

export default supplierSlice.reducer;
