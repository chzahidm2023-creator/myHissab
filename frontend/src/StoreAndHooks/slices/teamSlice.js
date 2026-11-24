import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const getAllTeamMembers = createAsyncThunk(
  "teamMember/getAllTeamMembers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page,
        limit,
        search = "",
        status = "all",
        period,
        startDate,
        endDate,
      } = params;

      const queryParams = { search, status };

      if (page !== undefined) queryParams.page = page;
      if (limit !== undefined) queryParams.limit = limit;
      if (period !== undefined) queryParams.period = period;
      if (startDate !== undefined) queryParams.startDate = startDate;
      if (endDate !== undefined) queryParams.endDate = endDate;

      const response = await api.get("users/list", {
        params: queryParams,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createTeamMember = createAsyncThunk(
  "teamMember/createTeamMember",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("users/add", formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateTeamMember = createAsyncThunk(
  "teamMember/updateTeamMember",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`users/${id}`, formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteTeamMember = createAsyncThunk(
  "teamMember/deleteTeamMember",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const getTeamMemberById = createAsyncThunk(
  "teamMember/getTeamMemberById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`users/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  teamMembers: [],
  selectedMember: null,
  currentPage: 1,
  limit: 10,
  totalPages: 1,
  totalMembers: 0,
  loading: false,
  actionLoading: false,
  error: null,
};

const teamMemberSlice = createSlice({
  name: "teamMember",
  initialState,
  reducers: {
    clearTeamMemberError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload.data || [];

        const pagination = action.payload.pagination || {};

        state.currentPage = pagination.currentPage ?? 1;
        state.limit = pagination.limit ?? 10;
        state.totalPages = pagination.totalPages ?? 1;
        state.totalMembers = pagination.total ?? 0;
      })
      .addCase(getAllTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createTeamMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.teamMembers.unshift(action.payload);
        state.totalMembers += 1;
      })
      .addCase(createTeamMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateTeamMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.teamMembers = state.teamMembers.map((member) =>
          member._id === action.payload._id ? action.payload : member,
        );
        state.selectedMember = action.payload;
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteTeamMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.teamMembers = state.teamMembers.filter(
          (member) => member._id !== action.payload,
        );
        state.totalMembers = Math.max(0, state.totalMembers - 1);
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getTeamMemberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamMemberById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMember = action.payload;
      })
      .addCase(getTeamMemberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearTeamMemberError } = teamMemberSlice.actions;
export default teamMemberSlice.reducer;
