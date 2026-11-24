import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getSetting = createAsyncThunk(
  "businessSettings/getSetting",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("settings/setting-information");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateBusinessSettings = createAsyncThunk(
  "businessSettings/updateBusinessSettings",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`settings/${id}`, formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  settings: null,
  loading: false,
  actionLoading: false,
  error: null,
  success: false,
};

const businessSettingsSlice = createSlice({
  name: "businessSettings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSettingsSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateBusinessSettings.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBusinessSettings.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.settings = action.payload;
      })
      .addCase(updateBusinessSettings.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSettingsError, clearSettingsSuccess } =
  businessSettingsSlice.actions;
export default businessSettingsSlice.reducer;
