import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data || {
      message: error.message || "Something went wrong",
    },
  );

const getCategoriesData = (response) =>
  response?.data ?? response?.categories ?? response;

export const registerCategory = createAsyncThunk(
  "category/register",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "expense-categories/add-category",
        categoryData,
      );
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `expense-categories/update-category/${id}`,
        categoryData,
      );
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getCategoryById = createAsyncThunk(
  "category/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`expense-categories/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`expense-categories/delete/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getExpendeCategoryList = createAsyncThunk(
  "category/getList",
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

      const params = {
        search: search.trim(),
        status: validStatus,
      };

      if (page !== undefined) params.page = page;
      if (limit !== undefined) params.limit = limit;
      if (period) params.period = period;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("expense-categories/list", { params });
      console.log("____________SS", response.data);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

const initialState = {
  categories: [],
  selectedCategory: null,
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

const categorySlice = createSlice({
  name: "Category",
  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },

    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },

    clearCategorySuccess: (state) => {
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    const requests = [
      registerCategory,
      updateCategory,
      getCategoryById,
      deleteCategory,
      getExpendeCategoryList,
    ];

    requests.forEach((request) => {
      builder
        .addCase(request.pending, (state) => {
          state.loading = true;
          state.error = null;

          if (
            request === registerCategory ||
            request === updateCategory ||
            request === deleteCategory
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

    builder.addCase(registerCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedCategory = getCategoriesData(action.payload);
    });

    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedCategory = getCategoriesData(action.payload);
    });

    builder.addCase(getCategoryById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCategory = getCategoriesData(action.payload);
    });

    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      const deletedId = String(action.payload);

      state.categories = state.categories.filter(
        (category) => String(category._id ?? category.id) !== deletedId,
      );

      if (
        String(
          state.selectedCategory?._id ?? state.selectedCategory?.id ?? "",
        ) === deletedId
      ) {
        state.selectedCategory = null;
      }
    });

    builder.addCase(getExpendeCategoryList.fulfilled, (state, action) => {
      state.loading = false;

      const payload = action.payload ?? {};
      const categories = payload.data;

      state.categories = Array.isArray(categories)
        ? categories
        : (payload.categories ?? payload.items ?? payload.results ?? []);

      const pagination = payload.pagination ?? {};

      state.pagination = {
        page: Number(pagination.currentPage ?? pagination.page ?? 1),
        limit: Number(pagination.limit ?? 10),
        total: Number(
          pagination.totalCategories ??
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
  clearCategoryError,
  clearSelectedCategory,
  clearCategorySuccess,
} = categorySlice.actions;

export default categorySlice.reducer;
