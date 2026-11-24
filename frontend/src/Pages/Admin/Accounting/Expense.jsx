import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2 } from "lucide-react";
import {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  clearCurrentExpense,
} from "../../../StoreAndHooks/slices/expenseSlice";
import { getExpendeCategoryList } from "../../../StoreAndHooks/slices/expnCategorySlice";
import ExpenseModal from "../Forms/ExpenseForm";
import ViewExpenseModal from "../viewModals/ExpneseView";
import DeleteModal from "../viewModals/DeleteModal";

export default function Expenses() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    expenses = [],
    currentExpense,
    currentPage,
    totalPages,
    totalExpenses,
    loading,
    detailsLoading,
    actionLoading,
  } = useSelector((state) => state.expenses);
  const { expnCategories = [] } = useSelector(
    (state) => state.categoriesExense || {},
  );

  useEffect(() => {
    dispatch(getExpendeCategoryList({ limit: "all", status: "active" }));
  }, [dispatch]);
  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};
  const paginationLimit = Number(preferences.paginationLimit) || 10;

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const searchTerm = searchParams.get("search") || "";
  const pages = Math.max(1, Number(totalPages) || 1);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [searchInput, setSearchInput] = useState(searchTerm);

  const settingsB = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settingsB.businessDetails || {};
  const currency = business.currency || "PKR";

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (page > pages) {
      setSearchParams({
        ...(searchTerm && { search: searchTerm }),
        page: String(pages),
      });
    }
  }, [page, pages, searchTerm, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getExpenses({
          page,
          limit: paginationLimit,
          search: searchTerm,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, page, searchTerm, paginationLimit]);

  const handleSearch = (value) => {
    setSearchInput(value);
    setSearchParams(value ? { search: value, page: "1" } : { page: "1" });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;

    setSearchParams({
      ...(searchTerm && { search: searchTerm }),
      page: String(newPage),
    });
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchParams({ page: "1" });
  };

  const handleEdit = async (id) => {
    setSelectedExpense(null);
    dispatch(clearCurrentExpense());

    try {
      const expense = await dispatch(getExpenseById(id)).unwrap();
      setSelectedExpense(expense);
      setIsExpenseModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };
  const handleAdd = () => {
    setSelectedExpense(null);
    dispatch(clearCurrentExpense());
    setIsExpenseModalOpen(true);
  };
  const handleSaveExpense = async (formData) => {
    try {
      if (selectedExpense?._id) {
        await dispatch(
          updateExpense({ id: selectedExpense._id, formData }),
        ).unwrap();
      } else {
        await dispatch(createExpense(formData)).unwrap();
      }

      setIsExpenseModalOpen(false);
      setSelectedExpense(null);

      dispatch(
        getExpenses({
          page,
          limit: paginationLimit,
          search: searchTerm,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = async (id) => {
    dispatch(clearCurrentExpense());
    setIsViewModalOpen(true);

    try {
      await dispatch(getExpenseById(id)).unwrap();
    } catch (error) {
      setIsViewModalOpen(false);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await dispatch(deleteExpense(expenseToDelete._id)).unwrap();

      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);

      if (expenses.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        dispatch(
          getExpenses({
            page,
            limit: paginationLimit,
            search: searchTerm,
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-3 top-2.5 text-slate-400"
              />
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search expenses..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleReset}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <div className="ml-auto text-xs text-slate-500">
              {totalExpenses || 0} Records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 table-fixed">
              <thead className="bg-slate-50 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 text-center py-3.5 whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-5 text-center py-3.5 whitespace-nowrap">
                    Amount
                  </th>
                  <th className="px-5 text-center py-3.5 whitespace-nowrap">
                    Method
                  </th>
                  <th className="px-5 text-center py-3.5 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {expenses.length > 0 ? (
                  expenses.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5 text-center font-medium whitespace-nowrap">
                        {item.date?.split("T")[0]}
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold text-slate-900 whitespace-nowrap">
                        {currency} {Number(item.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {item.method}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(item._id)}
                            disabled={detailsLoading}
                            title="View"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleEdit(item._id)}
                            disabled={detailsLoading}
                            title="Edit"
                            className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors disabled:opacity-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setExpenseToDelete(item);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete"
                            className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-12 text-slate-400"
                    >
                      {loading
                        ? "Loading expenses..."
                        : "No expense records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={totalExpenses || 0}
            currentPage={Math.min(page, pages)}
            totalPages={pages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedExpense(null);
          dispatch(clearCurrentExpense());
        }}
        onSave={handleSaveExpense}
        expenseData={selectedExpense}
        loading={actionLoading || detailsLoading}
      />

      <ViewExpenseModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          dispatch(clearCurrentExpense());
        }}
        expense={currentExpense}
        loading={detailsLoading}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        itemName={expenseToDelete?.description || ""}
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        loading={actionLoading}
      />
    </div>
  );
}
