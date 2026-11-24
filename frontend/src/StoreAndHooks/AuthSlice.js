import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./services/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("users/login", formData);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("roles", JSON.stringify(data.data.roles));
      localStorage.setItem(
        "permissions",
        JSON.stringify(data.data.permissions),
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  },
);

const savedUser = localStorage.getItem("user");
const savedRoles = localStorage.getItem("roles");
const savedPermissions = localStorage.getItem("permissions");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  roles: savedRoles ? JSON.parse(savedRoles) : [],
  permissions: savedPermissions ? JSON.parse(savedPermissions) : [],
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  success: false,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.success = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      localStorage.removeItem("permissions");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
        state.roles = action.payload.data.roles;
        state.permissions = action.payload.data.permissions;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
