import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import CategoryFormModal from "../Forms/AdditionForm";
import ViewCategoryModal from "../viewModals/AdditionView";
import DeleteModal from "../viewModals/DeleteModal";
import {
  registerUnit,
  updateUnit,
  deleteUnit,
  getUnitList,
} from "../../../StoreAndHooks/slices/unitSlice";
import Pagination from "../../../components/Pagination";
const getInitialFilters = () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "all";

  return {
    search: params.get("search") || "",
    status: ["all", "active", "inactive"].includes(status) ? status : "all",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
};

export default function Units() {
  const dispatch = useDispatch();
  const {
    units = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.units || state.unit || {});
  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};

  const limit = Number(preferences.paginationLimit) || 10;
  const period = preferences.defaultPeriod || "all";
  const startDate = preferences.customStartDate?.slice(0, 10);
  const endDate = preferences.customEndDate?.slice(0, 10);

  const [initial] = useState(getInitialFilters);
  const [search, setSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [page, setPage] = useState(initial.page);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const params = {
    page,
    search: debouncedSearch.trim(),
    status,
    period,
    ...(period === "custom" && { startDate, endDate }),
  };

  const total = Number(
    pagination.totalUnits ?? pagination.total ?? pagination.count ?? 0,
  );
  const currentLimit = Number(pagination.limit) || limit;
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || Math.ceil(total / currentLimit),
  );
  const activePage = Number(pagination.currentPage ?? pagination.page ?? page);
  const start = total ? (activePage - 1) * currentLimit + 1 : 0;
  const end = total ? Math.min(start + units.length - 1, total) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    search.trim() ? query.set("search", search.trim()) : query.delete("search");
    status !== "all" ? query.set("status", status) : query.delete("status");
    query.set("page", String(page));

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${query.toString()}${window.location.hash}`,
    );
  }, [search, status, page]);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(getUnitList(params)), 300);
    return () => clearTimeout(timer);
  }, [
    dispatch,
    page,
    debouncedSearch,
    status,
    period,
    startDate,
    endDate,
    limit,
  ]);

  const refresh = () => dispatch(getUnitList(params)).unwrap();

  const handleSave = async (data) => {
    setActionError("");
    setActionLoading(true);

    try {
      const unitData = {
        ...data,
        isActive:
          String(data.status || "").toLowerCase() === "active" ||
          data.isActive === true,
      };

      if (modal === "edit") {
        await dispatch(
          updateUnit({
            id: selected?._id ?? selected?.id,
            unitData,
          }),
        ).unwrap();
      } else {
        await dispatch(registerUnit(unitData)).unwrap();
      }

      setModal("");
      setSelected(null);
      await refresh();
    } catch (error) {
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    setActionLoading(true);
    setActionError("");

    try {
      await dispatch(deleteUnit(selected._id ?? selected.id)).unwrap();
      setModal("");
      setSelected(null);

      if (units.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await refresh();
      }
    } catch (error) {
      setActionError(error?.message || "Unable to delete unit");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (type, unit = null) => {
    setActionError("");
    setSelected(unit);
    setModal(type);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Units</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm"
          >
            + Add unit
          </button>
        </div>

        {actionError && (
          <div className="flex justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
            {actionError}
            <button onClick={() => setActionError("")}>Dismiss</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-2.5 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search units..."
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => setPage(1)}
                className="text-xs px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Filter
              </button>
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setPage(1);
                }}
                className="text-xs px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200"
              >
                Reset
              </button>
            </div>
            <div className="text-xs text-slate-400 text-right">
              {total} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              {loading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 overflow-hidden z-10">
                  <div className="h-full w-1/3 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
                </div>
              )}

              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Name</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">
                      Description
                    </th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Active</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {units.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-slate-400"
                      >
                        {loading ? "Loading units..." : "No units found."}
                      </td>
                    </tr>
                  ) : (
                    units.map((unit) => {
                      const active =
                        typeof unit.isActive === "boolean"
                          ? unit.isActive
                          : String(unit.status || "").toLowerCase() ===
                            "active";

                      return (
                        <tr
                          key={unit._id || unit.id}
                          className="hover:bg-slate-50/80 transition-colors duration-150"
                        >
                          <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {unit.name}
                          </td>

                          <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate whitespace-nowrap">
                            {unit.description || "-"}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                                active
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5  whitespace-nowrap">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => openModal("view", unit)}
                                title="View"
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => openModal("edit", unit)}
                                title="Edit"
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => openModal("delete", unit)}
                                title="Delete"
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            totalItems={total}
            startIndex={start}
            currentItemsCount={end - start + 1}
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>

      <CategoryFormModal
        isOpen={modal === "add" || modal === "edit"}
        onClose={() => {
          if (!actionLoading) {
            setModal("");
            setSelected(null);
            setActionError("");
          }
        }}
        onSubmit={handleSave}
        initialData={modal === "edit" ? selected : null}
        title={modal === "edit" ? "Update unit" : "Add unit"}
        description={
          modal === "edit"
            ? "Update existing unit details."
            : "Fill in the details to save a new unit."
        }
        submitText={
          actionLoading
            ? "Saving..."
            : modal === "edit"
              ? "Save Changes"
              : "Save unit"
        }
      />

      <ViewCategoryModal
        addValue={modal === "view" ? selected : null}
        onClose={() => setModal("")}
        onEdit={(unit) => openModal("edit", unit)}
      />
      <DeleteModal
        isOpen={modal === "delete"}
        onClose={() => {
          setModal("");
          setSelected(null);
        }}
        onConfirm={handleDelete}
        title="Delete Unit"
        itemName={selected?.name}
        description="Are you sure you want to delete this unit? Products linked to this unit may need re-assigning."
      />
    </div>
  );
}
