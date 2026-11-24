import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

const handleError = (error, rejectWithValue) =>
  rejectWithValue(
    error.response?.data || {
      message: error.message || "Something went wrong",
    },
  );

const getUnitsData = (response) =>
  response?.data ?? response?.units ?? response;

export const registerUnit = createAsyncThunk(
  "unit/register",
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await api.post("units/add-unit", unitData);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const updateUnit = createAsyncThunk(
  "unit/update",
  async ({ id, unitData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`units/update-unit/${id}`, unitData);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getUnitById = createAsyncThunk(
  "unit/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`units/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const deleteUnit = createAsyncThunk(
  "unit/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`units/delete/${id}`);
      return id;
    } catch (error) {
      return handleError(error, rejectWithValue);
    }
  },
);

export const getUnitList = createAsyncThunk(
  "unit/getList",
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
      const normalizedStatus = String(status || "all")
        .trim()
        .toLowerCase();
      const validStatus = ["all", "active", "inactive"].includes(
        normalizedStatus,
      )
        ? normalizedStatus
        : "all";

      const response = await api.get("units/list", {
        params: {
          page,
          ...(limit && { limit }),
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
  units: [],
  selectedUnit: null,
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

const unitSlice = createSlice({
  name: "Unit",
  initialState,
  reducers: {
    clearUnitError: (state) => {
      state.error = null;
    },
    clearSelectedUnit: (state) => {
      state.selectedUnit = null;
    },
    clearUnitSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const requests = [
      registerUnit,
      updateUnit,
      getUnitById,
      deleteUnit,
      getUnitList,
    ];

    requests.forEach((request) => {
      builder
        .addCase(request.pending, (state) => {
          state.loading = true;
          state.error = null;

          if (
            request === registerUnit ||
            request === updateUnit ||
            request === deleteUnit
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

    builder.addCase(registerUnit.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedUnit = getUnitsData(action.payload);
    });

    builder.addCase(updateUnit.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.selectedUnit = getUnitsData(action.payload);
    });

    builder.addCase(getUnitById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedUnit = getUnitsData(action.payload);
    });

    builder.addCase(deleteUnit.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      const deletedId = String(action.payload);
      state.units = state.units.filter(
        (unit) => String(unit._id ?? unit.id) !== deletedId,
      );

      if (
        String(state.selectedUnit?._id ?? state.selectedUnit?.id ?? "") ===
        deletedId
      ) {
        state.selectedUnit = null;
      }
    });

    builder.addCase(getUnitList.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload ?? {};
      const pagination = payload.pagination ?? {};

      state.units = Array.isArray(payload.data)
        ? payload.data
        : (payload.units ?? payload.items ?? payload.results ?? []);

      state.pagination = {
        page: Number(pagination.currentPage ?? pagination.page ?? 1),
        limit: Number(pagination.limit ?? 10),
        total: Number(
          pagination.totalUnits ??
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

export const { clearUnitError, clearSelectedUnit, clearUnitSuccess } =
  unitSlice.actions;

export default unitSlice.reducer;
