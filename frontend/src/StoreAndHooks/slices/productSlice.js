import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) => {
  const responseData = error?.response?.data;

  return rejectWithValue({
    success: false,
    message:
      (typeof responseData === "string" && responseData) ||
      responseData?.message ||
      responseData?.error ||
      error?.message ||
      "Something went wrong. Please try again.",
    status: error?.response?.status || responseData?.status || null,
  });
};

const getErrorMessage = (action) =>
  action.payload?.message ||
  action.payload ||
  action.error?.message ||
  "Something went wrong.";

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("products/list", {
        params: {
          page: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const firstResponse = await api.get("products/list", {
        params: {
          page: 1,
          limit: 100,
          period: "all",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      const firstData = firstResponse.data.data || [];
      const totalPages = Number(firstResponse.data.pagination?.totalPages) || 1;

      if (totalPages <= 1) return firstData;

      const responses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          api.get("products/list", {
            params: {
              page: index + 2,
              limit: 100,
              period: "all",
              sortBy: "createdAt",
              sortOrder: "desc",
            },
          }),
        ),
      );

      return [
        ...firstData,
        ...responses.flatMap((response) => response.data.data || []),
      ];
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getAllStockHistory = createAsyncThunk(
  "product/getAllStockHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("products/stock-history/list", {
        params: { page: 1, ...params },
      });
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("products/add-product", formData);
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`products/update-product/${id}`, formData);
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`products/delete-product/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateStockAdjustment = createAsyncThunk(
  "product/updateStockAdjustment",
  async ({ id, adjustmentType, quantity, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`products/adjustStock/${id}`, {
        adjustmentType,
        quantity,
        reason,
      });
      return response.data.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

const initialState = {
  products: [],
  allProducts: [],
  allProductsLoading: false,
  stockHistory: [],
  stockHistoryPagination: {},
  stockHistoryLoading: false,
  currentPage: 1,
  currentLimit: 10,
  totalPages: 1,
  totalProducts: 0,
  queryParams: {
    page: 1,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  loading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductSuccess: (state) => {
      state.success = false;
    },
    clearProductFilters: (state) => {
      state.queryParams = {
        page: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
    },
    clearStockHistory: (state) => {
      state.stockHistory = [];
      state.stockHistoryPagination = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const pagination = payload.pagination || {};

        state.products = payload.data || [];
        state.currentPage = Number(pagination.currentPage) || 1;
        state.currentLimit = Number(pagination.limit) || 10;
        state.totalPages = Number(pagination.totalPages) || 1;
        state.totalProducts = Number(pagination.totalProducts) || 0;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(getAllProducts.pending, (state) => {
        state.allProductsLoading = true;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.allProductsLoading = false;
        state.allProducts = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.allProductsLoading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(getAllStockHistory.pending, (state) => {
        state.stockHistoryLoading = true;
      })
      .addCase(getAllStockHistory.fulfilled, (state, action) => {
        state.stockHistoryLoading = false;
        state.stockHistory = action.payload.data || [];
        state.stockHistoryPagination = action.payload.pagination || {};
      })
      .addCase(getAllStockHistory.rejected, (state, action) => {
        state.stockHistoryLoading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(createProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        if (state.currentPage === 1) state.products.unshift(action.payload);
        state.allProducts.unshift(action.payload);
        state.totalProducts += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product,
        );
        state.allProducts = state.allProducts.map((product) =>
          product._id === action.payload._id ? action.payload : product,
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(deleteProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.products = state.products.filter(
          (product) => product._id !== action.payload,
        );
        state.allProducts = state.allProducts.filter(
          (product) => product._id !== action.payload,
        );
        state.totalProducts = Math.max(0, state.totalProducts - 1);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = getErrorMessage(action);
      })
      .addCase(updateStockAdjustment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStockAdjustment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const updateStock = (list) => {
          const product = list.find(
            (item) => item._id === action.payload.productId,
          );

          if (product) {
            product.openingStock = action.payload.updatedStock;
            product.stockHistory = [
              ...(product.stockHistory || []),
              action.payload.latestAdjustment,
            ];
          }
        };

        updateStock(state.products);
        updateStock(state.allProducts);
      })
      .addCase(updateStockAdjustment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = getErrorMessage(action);
      });
  },
});

export const {
  clearProductError,
  clearProductSuccess,
  clearProductFilters,
  clearStockHistory,
} = productSlice.actions;

export default productSlice.reducer;
