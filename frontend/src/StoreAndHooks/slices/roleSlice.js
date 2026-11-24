import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getAllRoles = createAsyncThunk(
  "role/getAllRoles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("roles/list", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getRoleById = createAsyncThunk(
  "role/getRoleById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`roles/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createRole = createAsyncThunk(
  "role/createRole",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("roles/add", formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`roles/${id}`, formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`roles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  roles: [],
  selectedRole: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data || [];
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles = state.roles.map((role) =>
          role._id === action.payload._id ? action.payload : role,
        );
        state.selectedRole = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles = state.roles.filter((role) => role._id !== action.payload);
        if (state.selectedRole?._id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearRoleError, clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
