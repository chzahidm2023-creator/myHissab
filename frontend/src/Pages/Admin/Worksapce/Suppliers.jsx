import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { NotebookPen, View, Trash, ReceiptPoundSterling } from "lucide-react";
import CustomerFormModal from "../Forms/CustomerForm";
import ViewCustomerModal from "../viewModals/ViewCustomer";
import DeleteModal from "../viewModals/DeleteModal";
import LedgerModal from "../viewModals/LedgerModal";
import { useDispatch, useSelector } from "react-redux";
import {
  registerSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierList,
} from "../../../StoreAndHooks/slices/supplierSlice";
import { getSupplierLedger } from "../../../StoreAndHooks/slices/paymentSlice";
import Pagination from "../../../components/Pagination";

export default function Suppliers() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { settings } = useSelector((state) => state.businessSettings);
  const preferences = settings?.systemPreferences || {};
  const paginationLimit = Number(preferences.paginationLimit) || 10;
  const defaultPeriod = preferences.defaultPeriod || "all";

  const {
    suppliers = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.suppliers || {});

  const {
    ledger = [],
    loading: ledgerLoading,
    error: ledgerError,
  } = useSelector((state) => state.payments || {});

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState(
    ["active", "inactive"].includes(searchParams.get("status"))
      ? searchParams.get("status")
      : "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1),
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [selectedViewSupplier, setSelectedViewSupplier] = useState(null);
  const [selectedLedgerParty, setSelectedLedgerParty] = useState(null);

  const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
  const totalRecords = Number(
    pagination.total ?? pagination.totalSuppliers ?? pagination.count ?? 0,
  );
  const activePage =
    Number(pagination.page ?? pagination.currentPage) || currentPage;
  const currentLimit = Number(pagination.limit) || paginationLimit;
  const startIndex = totalRecords ? (activePage - 1) * currentLimit + 1 : 0;
  const endIndex = totalRecords
    ? Math.min(startIndex + suppliers.length - 1, totalRecords)
    : 0;

  const fetchSuppliers = () =>
    dispatch(
      getSupplierList({
        page: currentPage,
        limit: paginationLimit,
        search: searchTerm.trim(),
        status: statusFilter,
        period: defaultPeriod,
      }),
    );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(currentPage));
    params.set("limit", String(paginationLimit));

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    paginationLimit,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    const timer = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, statusFilter, paginationLimit, defaultPeriod]);

  const handleSubmit = async (action, data) => {
    setActionLoading(true);

    try {
      await dispatch(action(data)).unwrap();

      dispatch(
        getSupplierList({
          page: currentPage,
          limit: paginationLimit,
          search: searchTerm.trim(),
          status: statusFilter,
          period: defaultPeriod,
        }),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSupplier = (data) => handleSubmit(registerSupplier, data);

  const handleUpdateSupplier = (data) =>
    handleSubmit(updateSupplier, {
      id: supplierToEdit?._id,
      supplierData: data,
    });

  const handleConfirmDelete = async () => {
    if (!supplierToDelete?._id || actionLoading) return;

    setActionLoading(true);

    try {
      await dispatch(deleteSupplier(supplierToDelete._id)).unwrap();

      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);

      if (suppliers.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        fetchSuppliers();
      }
    } catch (error) {
      console.error(error?.message || "Unable to delete supplier");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenLedger = (supplier) => {
    setSelectedLedgerParty(supplier);
    setIsLedgerOpen(true);
    dispatch(getSupplierLedger(supplier._id));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-4 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Suppliers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your supplier records in one place.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Add supplier
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 text-xs px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
              />

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200"
              >
                Reset
              </button>
            </div>

            <div className="text-xs text-slate-400 font-medium text-right">
              {totalRecords} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              {loading && suppliers.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-10">
                  <div className="h-full w-1/3 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
                </div>
              )}

              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Name</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Phone</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Active
                    </th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Ledger</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading && suppliers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-slate-400"
                      >
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : suppliers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-slate-400"
                      >
                        No suppliers found.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((sup) => {
                      const active =
                        sup.isActive ??
                        String(sup.status).toLowerCase() === "active";

                      return (
                        <tr key={sup._id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {sup.name}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {sup.phone}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            {sup.email}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
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
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            <button
                              onClick={() => handleOpenLedger(sup)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                            >
                              <ReceiptPoundSterling />
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedViewSupplier(sup)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <View size={15} />
                              </button>

                              <button
                                onClick={() => {
                                  setSupplierToEdit(sup);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <NotebookPen size={15} />
                              </button>

                              <button
                                onClick={() => {
                                  setSupplierToDelete(sup);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                              >
                                <Trash size={15} />
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

      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => !actionLoading && setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
        initialData={null}
        title="Add Supplier"
        description="Fill in the details to register a new supplier."
        submitText="Add Supplier"
        entityName="Supplier"
      />

      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (actionLoading) return;
          setIsEditModalOpen(false);
          setSupplierToEdit(null);
        }}
        onSubmit={handleUpdateSupplier}
        initialData={supplierToEdit}
        title="Update Supplier"
        description="Update existing supplier record details."
        submitText="Save Changes"
        entityName="Supplier"
      />

      <LedgerModal
        isOpen={isLedgerOpen}
        onClose={() => {
          setIsLedgerOpen(false);
          setSelectedLedgerParty(null);
        }}
        party={selectedLedgerParty}
        partyType="supplier"
        ledger={ledger}
        loading={ledgerLoading}
        error={ledgerError}
      />

      <ViewCustomerModal
        customer={selectedViewSupplier}
        onClose={() => setSelectedViewSupplier(null)}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (actionLoading) return;
          setIsDeleteModalOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        itemName={supplierToDelete?.name}
        description="Are you sure you want to delete this supplier record? All associated data will be permanently removed."
      />
    </div>
  );
}
