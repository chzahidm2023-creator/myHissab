import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import BrandFormModal from "../Forms/AdditionForm";
import ViewBrandModal from "../viewModals/AdditionView";
import DeleteModal from "../viewModals/DeleteModal";
import Pagination from "../../../components/Pagination";
import {
  registerBrand,
  updateBrand,
  deleteBrand,
  getBrandList,
} from "../../../StoreAndHooks/slices/brandSlice";

const getInitialFilters = () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "all";
  return {
    search: params.get("search") || "",
    status: ["all", "active", "inactive"].includes(status) ? status : "all",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
};

const getIsActive = (data) =>
  data.status != null
    ? String(data.status).toLowerCase() === "active"
    : data.isActive === true;

export default function Brands() {
  const dispatch = useDispatch();
  const {
    brands = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.brands || {});
  const { settings } = useSelector((state) => state.businessSettings || {});

  const preferences = settings?.systemPreferences || {};
  const limit = Number(preferences.paginationLimit) || 10;
  const period = preferences.defaultPeriod || "all";
  const startDate = preferences.customStartDate?.slice(0, 10);
  const endDate = preferences.customEndDate?.slice(0, 10);

  const initial = getInitialFilters();
  const [search, setSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [page, setPage] = useState(initial.page);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const total = Number(pagination.total ?? 0);
  const currentLimit = Number(pagination.limit) || limit;
  const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
  const activePage = Number(pagination.page ?? page);
  const startIndex = total ? (activePage - 1) * currentLimit + 1 : 0;

  const loadBrands = () =>
    dispatch(
      getBrandList({
        page,
        limit,
        search: debouncedSearch,
        status,
        period,
        ...(period === "custom" && { startDate, endDate }),
      }),
    ).unwrap();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    search.trim() ? query.set("search", search.trim()) : query.delete("search");
    query.set("status", status);
    query.set("page", String(page));

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${query.toString()}${window.location.hash}`,
    );
  }, [search, status, page]);

  useEffect(() => {
    loadBrands();
  }, [page, debouncedSearch, status, period, startDate, endDate, limit]);

  const openModal = (type, brand = null) => {
    setActionError("");
    setSelected(brand);
    setModal(type);
  };

  const handleSave = async (data) => {
    setActionLoading(true);
    setActionError("");

    try {
      const brandData = { ...data, isActive: getIsActive(data) };

      if (modal === "edit") {
        await dispatch(
          updateBrand({
            id: selected?._id ?? selected?.id,
            brandData,
          }),
        ).unwrap();
      } else {
        await dispatch(registerBrand(brandData)).unwrap();
      }

      setModal("");
      setSelected(null);
      await loadBrands();
    } catch (error) {
      setActionError(error?.message || "Unable to save brand");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    setActionLoading(true);
    setActionError("");

    try {
      await dispatch(deleteBrand(selected._id ?? selected.id)).unwrap();
      setModal("");
      setSelected(null);

      if (brands.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadBrands();
      }
    } catch (error) {
      setActionError(error?.message || "Unable to delete brand");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm"
          >
            + Add brand
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
                  placeholder="Search brands..."
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

          <div className="relative overflow-x-auto">
            {loading && brands.length > 0 && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-100 z-10 overflow-hidden">
                <div className="h-full w-1/3 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
              </div>
            )}

            <table className="w-full table-fixed text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 w-[22%] whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-5 py-3.5 w-[38%] whitespace-nowrap">
                    Description
                  </th>
                  <th className="px-5 py-3.5 w-[15%] whitespace-nowrap">
                    Active
                  </th>
                  <th className="px-5 py-3.5 w-[25%] text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400">
                      {loading ? "Loading brands..." : "No brands found."}
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => {
                    const active =
                      typeof brand.isActive === "boolean"
                        ? brand.isActive
                        : String(brand.status || "").toLowerCase() === "active";

                    return (
                      <tr
                        key={brand._id || brand.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                          {brand.name}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 truncate whitespace-nowrap">
                          {brand.description || "-"}
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

                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openModal("view", brand)}
                              title="View"
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openModal("edit", brand)}
                              title="Edit"
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => openModal("delete", brand)}
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

          <Pagination
            totalItems={total}
            startIndex={startIndex}
            currentItemsCount={brands.length}
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>

      <BrandFormModal
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
        title={modal === "edit" ? "Update brand" : "Add brand"}
        description={
          modal === "edit"
            ? "Update existing brand details."
            : "Fill in the details to save a new brand."
        }
        submitText={
          actionLoading
            ? "Saving..."
            : modal === "edit"
              ? "Save Changes"
              : "Save brand"
        }
      />

      <ViewBrandModal
        addValue={modal === "view" ? selected : null}
        onClose={() => setModal("")}
        onEdit={(brand) => openModal("edit", brand)}
      />

      <DeleteModal
        isOpen={modal === "delete"}
        onClose={() => {
          setModal("");
          setSelected(null);
        }}
        onConfirm={handleDelete}
        title="Delete Brand"
        itemName={selected?.name}
        description="Are you sure you want to delete this brand?"
      />
    </div>
  );
}
