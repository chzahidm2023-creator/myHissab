import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data || {
      message: error.message || "Something went wrong",
    },
  );

const getBrandsData = (response) =>
  response?.data ?? response?.brands ?? response;

export const registerBrand = createAsyncThunk(
  "brand/register",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await api.post("brands/add-brand", brandData);
      console.log("________________brand", response);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateBrand = createAsyncThunk(
  "brand/update",
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`brands/update-brand/${id}`, brandData);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getBrandById = createAsyncThunk(
  "brand/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`brands/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteBrand = createAsyncThunk(
  "brand/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`brands/delete/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getBrandList = createAsyncThunk(
  "brand/getList",
  async (
    {
      page,
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
      const normalizedStatus = String(status || "all")
        .trim()
        .toLowerCase();
      const validStatus = ["all", "active", "inactive"].includes(
        normalizedStatus,
      )
        ? normalizedStatus
        : "all";

      const response = await api.get("brands/list", {
        params: {
          page,
          limit,
          search: search.trim(),
          status: validStatus,
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
  brands: [],
  selectedBrand: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  success: false,
};

const brandSlice = createSlice({
  name: "Brand",
  initialState,
  reducers: {
    clearBrandError: (state) => {
      state.error = null;
    },
    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
    },
    clearBrandSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const requests = [registerBrand, updateBrand, getBrandById, deleteBrand];

    requests.forEach((request) => {
      builder
        .addCase(request.pending, (state) => {
          state.loading = true;
          state.error = null;
          state.success = false;
        })
        .addCase(request.rejected, (state, action) => {
          state.loading = false;
          state.error =
            action.payload?.message || action.error.message || "Request failed";
        });
    });

    builder
      .addCase(getBrandList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrandList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || action.error.message || "Request failed";
      });

    builder.addCase(registerBrand.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedBrand = getBrandsData(action.payload);
    });

    builder.addCase(updateBrand.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedBrand = getBrandsData(action.payload);
    });

    builder.addCase(getBrandById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedBrand = getBrandsData(action.payload);
    });

    builder.addCase(deleteBrand.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      const deletedId = String(action.payload);

      state.brands = state.brands.filter(
        (brand) => String(brand._id ?? brand.id) !== deletedId,
      );

      if (
        String(state.selectedBrand?._id ?? state.selectedBrand?.id ?? "") ===
        deletedId
      ) {
        state.selectedBrand = null;
      }
    });

    builder.addCase(getBrandList.fulfilled, (state, action) => {
      state.loading = false;

      const payload = action.payload ?? {};
      const pagination = payload.pagination ?? {};

      state.brands = Array.isArray(payload.data)
        ? payload.data
        : (payload.brands ?? payload.items ?? payload.results ?? []);

      state.pagination = {
        page: Number(pagination.currentPage ?? 1),
        limit: Number(pagination.limit ?? 10),
        total: Number(pagination.totalBrands ?? 0),
        totalPages: Number(pagination.totalPages ?? 0),
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPrevPage: Boolean(pagination.hasPrevPage),
      };
    });
  },
});

export const { clearBrandError, clearSelectedBrand, clearBrandSuccess } =
  brandSlice.actions;

export default brandSlice.reducer;
