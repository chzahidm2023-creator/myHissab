import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {} from "lucide-react";
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2 } from "lucide-react";
import CategoryFormModal from "../Forms/AdditionForm";
import ViewCategoryModal from "../viewModals/AdditionView";
import DeleteModal from "../viewModals/DeleteModal";
import Pagination from "../../../components/Pagination";
import {
  registerCategory,
  updateCategory,
  deleteCategory,
  getExpendeCategoryList,
} from "../../../StoreAndHooks/slices/expnCategorySlice";

export default function Categories() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    categories = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.categoriesExense || {});

  const { settings } = useSelector((state) => state.businessSettings || {});
  const paginationLimit =
    Number(settings?.systemPreferences?.paginationLimit) || 10;

  const initialStatus = searchParams.get("status") || "all";
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(
    ["all", "active", "inactive"].includes(initialStatus)
      ? initialStatus
      : "all",
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [selectedViewCategory, setSelectedViewCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const totalRecords = Number(
    pagination.totalCategories ?? pagination.total ?? 0,
  );
  const currentLimit = Number(pagination.limit) || paginationLimit;
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) ||
      Math.ceil(totalRecords / currentLimit) ||
      1,
  );
  const activePage = Number(pagination.currentPage ?? currentPage);
  const startIndex =
    totalRecords === 0 ? 0 : (activePage - 1) * currentLimit + 1;
  const endIndex =
    totalRecords === 0
      ? 0
      : Math.min(startIndex + categories.length - 1, totalRecords);

  useEffect(() => {
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    params.status = statusFilter;
    params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, currentPage, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getExpendeCategoryList({
          page: currentPage,
          limit: paginationLimit,
          search: searchTerm.trim(),
          status: statusFilter,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, currentPage, searchTerm, statusFilter, paginationLimit]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const refreshCategory = async () => {
    return dispatch(
      getExpendeCategoryList({
        page: currentPage,
        limit: paginationLimit,
        search: searchTerm.trim(),
        status: statusFilter,
      }),
    ).unwrap();
  };

  const handleAddCategory = async (formData) => {
    setActionError("");
    setActionLoading(true);

    try {
      await dispatch(registerCategory(formData)).unwrap();
      setIsAddModalOpen(false);
      await refreshCategory();
    } catch (error) {
      setActionError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to register category",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (formData) => {
    const categoryId = categoryToEdit?._id ?? categoryToEdit?.id;

    if (!categoryId) {
      setActionError("Category ID is missing");
      return;
    }

    setActionError("");
    setActionLoading(true);

    try {
      await dispatch(
        updateCategory({
          id: categoryId,
          categoryData: formData,
        }),
      ).unwrap();

      setIsEditModalOpen(false);
      setCategoryToEdit(null);
      await refreshCategory();
    } catch (error) {
      setActionError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update category",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (category) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    const categoryId = categoryToDelete._id ?? categoryToDelete.id;

    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await refreshCategory();
      }
    } catch (error) {
      setActionError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to delete category",
      );
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
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
            onClick={() => {
              setActionError("");
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Add category
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-blue-600 transition-all"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => setCurrentPage(1)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                Filter
              </button>

              <button
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors border border-slate-200"
              >
                Reset
              </button>
            </div>

            <div className="text-xs text-slate-400 font-medium text-right">
              {totalRecords} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative overflow-hidden">
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
                  {categories.map((cat) => {
                    const isActive =
                      typeof cat.isActive === "boolean"
                        ? cat.isActive
                        : String(cat.status || "").toLowerCase() === "active";

                    return (
                      <tr
                        key={cat._id || cat.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
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
                              isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 ">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedViewCategory(cat)}
                              title="View Details"
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Category"
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(cat)}
                              title="Delete Category"
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && categories.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-8 text-slate-400"
                      >
                        No categories found.
                      </td>
                    </tr>
                  )}
                  {loading && categories.length === 0 && (
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
                <div className="absolute top-0 right-0 px-3 py-2 pointer-events-none">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <Pagination
            totalItems={totalRecords}
            startIndex={startIndex}
            currentItemsCount={endIndex - startIndex + 1}
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      </div>

      <CategoryFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (actionLoading) return;
          setIsAddModalOpen(false);
          setActionError("");
        }}
        onSubmit={handleAddCategory}
        initialData={null}
        title="Add category"
        description="Fill in the details to save a new category."
        submitText="Save category"
      />

      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCategoryToEdit(null);
          setActionError("");
        }}
        onSubmit={handleUpdateCategory}
        initialData={categoryToEdit}
        title="Update category"
        description="Update existing category details."
        submitText="Save Changes"
      />

      <ViewCategoryModal
        addValue={selectedViewCategory}
        onClose={() => setSelectedViewCategory(null)}
        onEdit={handleOpenEdit}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        description="Are you sure you want to delete this category? Products linked to this category may need re-assigning."
        loading={actionLoading}
      />
    </div>
  );
}
