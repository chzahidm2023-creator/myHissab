import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getActivityLogs = createAsyncThunk(
  "activityLogs/getActivityLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { limit, ...queryParams } = params;

      const { data } = await api.get("/activity-logs/list", {
        params: {
          page: 1,
          ...queryParams,
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activity logs",
      );
    }
  },
);

const activityLogSlice = createSlice({
  name: "activityLogs",
  initialState: {
    logs: [],
    pagination: {
      total: 0,
      currentPage: 1,
      totalPages: 0,
      limit: 10,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearActivityLogs: (state) => {
      state.logs = [];
      state.pagination = {
        total: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 10,
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityLogs } = activityLogSlice.actions;
export default activityLogSlice.reducer;
