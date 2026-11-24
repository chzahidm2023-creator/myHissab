import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import CategoryFormModal from "../Forms/AdditionForm";
import ViewCategoryModal from "../viewModals/AdditionView";
import DeleteModal from "../viewModals/DeleteModal";
import Pagination from "../../../components/Pagination";
import {
  registerCategory,
  updateCategory,
  deleteCategory,
  getCategoryList,
} from "../../../StoreAndHooks/slices/categorySlice";

const getInitialFilters = () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "all";
  return {
    search: params.get("search") || "",
    status: ["all", "active", "inactive"].includes(status) ? status : "all",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
};

export default function Categories() {
  const dispatch = useDispatch();
  const {
    categories = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.categories || {});
  const { settings } = useSelector((state) => state.businessSettings || {});

  const preferences = settings?.systemPreferences || {};
  const limit = Number(preferences.paginationLimit) || 10;
  const period = preferences.defaultPeriod || "all";
  const startDate = preferences.customStartDate
    ? String(preferences.customStartDate).slice(0, 10)
    : "";
  const endDate = preferences.customEndDate
    ? String(preferences.customEndDate).slice(0, 10)
    : "";

  const [initial] = useState(getInitialFilters);
  const [search, setSearch] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [page, setPage] = useState(initial.page);
  const [refresh, setRefresh] = useState(0);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);

  const requestParams = {
    page,
    search: debouncedSearch,
    status,
    period,
    ...(period === "custom" && { startDate, endDate }),
  };

  const total = Number(pagination.totalCategories ?? pagination.total ?? 0);
  const currentLimit = Number(pagination.limit) || limit;
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || Math.ceil(total / currentLimit) || 1,
  );
  const activePage = Number(pagination.currentPage ?? pagination.page ?? page);
  const start = total ? (activePage - 1) * currentLimit + 1 : 0;
  const end = total ? Math.min(start + categories.length - 1, total) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("status", status);
    if (debouncedSearch) params.set("search", debouncedSearch);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    dispatch(getCategoryList(requestParams));
  }, [
    dispatch,
    page,
    debouncedSearch,
    status,
    period,
    startDate,
    endDate,
    refresh,
  ]);

  const refreshList = () => setRefresh((prev) => prev + 1);

  const handleSave = async (data) => {
    setActionLoading(true);
    setActionError("");

    try {
      if (modal === "add") {
        await dispatch(registerCategory(data)).unwrap();
      } else {
        await dispatch(
          updateCategory({
            id: selected._id ?? selected.id,
            categoryData: data,
          }),
        ).unwrap();
      }

      setModal("");
      setSelected(null);
      refreshList();
    } catch (error) {
      setActionError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to save category",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    setActionLoading(true);
    setActionError("");

    try {
      await dispatch(deleteCategory(selected._id ?? selected.id)).unwrap();
      setModal("");
      setSelected(null);

      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        refreshList();
      }
    } catch (error) {
      setActionError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to delete category",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const openModal = (type, category = null) => {
    setSelected(category);
    setActionError("");
    setModal(type);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Categories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="text-base">+</span> Add category
          </button>
        </div>

        {actionError && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search categories..."
                  className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3.5 py-2 rounded-lg"
              >
                Filter
              </button>
              <button
                onClick={resetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200"
              >
                Reset
              </button>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {total} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
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
                  {categories.length ? (
                    categories.map((cat) => {
                      const active =
                        typeof cat.isActive === "boolean"
                          ? cat.isActive
                          : String(cat.status || "").toLowerCase() === "active";

                      return (
                        <tr
                          key={cat._id || cat.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {cat.name}
                          </td>

                          <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                            {cat.description || "-"}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${
                                active
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openModal("view", cat)}
                                title="View"
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                onClick={() => openModal("edit", cat)}
                                title="Edit"
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() => openModal("delete", cat)}
                                title="Delete"
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : !loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-slate-400"
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-slate-400"
                      >
                        Loading Categories...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {loading && categories.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/3 bg-blue-500 animate-[loading_1.2s_ease-in-out_infinite]" />
                </div>
              )}
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
          if (actionLoading) return;
          setModal("");
          setSelected(null);
          setActionError("");
        }}
        onSubmit={handleSave}
        initialData={modal === "edit" ? selected : null}
        title={modal === "edit" ? "Update category" : "Add category"}
        description="Fill in the details to save a category."
        submitText={
          actionLoading
            ? "Saving..."
            : modal === "edit"
              ? "Save Changes"
              : "Save category"
        }
      />

      <ViewCategoryModal
        addValue={modal === "view" ? selected : null}
        onClose={() => {
          setModal("");
          setSelected(null);
        }}
        onEdit={(category) => openModal("edit", category)}
      />

      <DeleteModal
        isOpen={modal === "delete"}
        onClose={() => {
          if (actionLoading) return;
          setModal("");
          setSelected(null);
        }}
        onConfirm={handleDelete}
        title="Delete Category"
        itemName={selected?.name}
        description="Are you sure you want to delete this category? Products linked to this category may need re-assigning."
      />
    </div>
  );
}
