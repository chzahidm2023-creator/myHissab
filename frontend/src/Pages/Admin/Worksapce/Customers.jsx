import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  NotebookPen,
  View,
  Trash,
  ReceiptPoundSterling,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CustomerFormModal from "../Forms/CustomerForm";
import ViewCustomerModal from "../viewModals/ViewCustomer";
import DeleteModal from "../viewModals/DeleteModal";
import LedgerModal from "../viewModals/LedgerModal";
import {
  registerCustomer,
  updateCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomerList,
} from "../../../StoreAndHooks/slices/customerSlice";
import { getCustomerLedger } from "../../../StoreAndHooks/slices/paymentSlice";
import Pagination from "../../../components/Pagination";
export default function Customers() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};

  const paginationLimit = Number(preferences.paginationLimit) || 10;
  const defaultPeriod = preferences.defaultPeriod || "all";
  const startDate = preferences.customStartDate?.slice(0, 10);
  const endDate = preferences.customEndDate?.slice(0, 10);

  const {
    customers = [],
    pagination = {},
    loading,
    error,
  } = useSelector((state) => state.customers || {});

  const {
    ledger = [],
    loading: ledgerLoading,
    error: ledgerError,
  } = useSelector((state) => state.payments || {});

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(
    ["active", "inactive"].includes(searchParams.get("status"))
      ? searchParams.get("status")
      : "all",
  );
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1),
  );

  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedViewCustomer, setSelectedViewCustomer] = useState(null);
  const [selectedLedgerParty, setSelectedLedgerParty] = useState(null);

  const totalRecords = Number(pagination.totalCustomers || 0);
  const currentLimit = Number(pagination.limit) || paginationLimit;
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || Math.ceil(totalRecords / currentLimit),
  );
  const activePage = Number(pagination.currentPage) || currentPage;
  const startIndex = totalRecords ? (activePage - 1) * currentLimit + 1 : 0;
  const endIndex = totalRecords
    ? Math.min(startIndex + customers.length - 1, totalRecords)
    : 0;

  const requestParams = {
    page: currentPage,
    search: debouncedSearch.trim(),
    status: statusFilter,
    period: defaultPeriod,
    ...(defaultPeriod === "custom" && { startDate, endDate }),
  };

  const refreshCustomers = () =>
    dispatch(
      getCustomerList({
        ...requestParams,
        search: searchTerm.trim(),
      }),
    ).unwrap();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    searchTerm.trim()
      ? params.set("search", searchTerm.trim())
      : params.delete("search");

    statusFilter !== "all"
      ? params.set("status", statusFilter)
      : params.delete("status");

    currentPage > 1
      ? params.set("page", String(currentPage))
      : params.delete("page");

    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, currentPage, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getCustomerList(requestParams));
    }, 300);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    currentPage,
    debouncedSearch,
    statusFilter,
    paginationLimit,
    defaultPeriod,
    startDate,
    endDate,
  ]);

  const handleAddCustomer = async (formData) => {
    await dispatch(registerCustomer(formData)).unwrap();

    dispatch(
      getCustomerList({
        ...requestParams,
        search: searchTerm.trim(),
      }),
    );
  };

  const handleUpdateCustomer = async (formData) => {
    const id = selected?._id || selected?.id;
    if (!id) throw new Error("Customer ID not found");

    await dispatch(updateCustomer({ id, customerData: formData })).unwrap();

    setSelected(null);

    dispatch(
      getCustomerList({
        ...requestParams,
        search: searchTerm.trim(),
      }),
    );
  };
  const handleOpenView = async (customer) => {
    const id = customer?._id || customer?.id;
    if (!id) return;

    setSelectedViewCustomer(null);

    try {
      const result = await dispatch(getCustomerById(id)).unwrap();
      setSelectedViewCustomer(
        result?.data?.customer ?? result?.data ?? result?.customer ?? result,
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenLedger = async (customer) => {
    const id = customer?._id || customer?.id;
    if (!id) return;
    setSelectedLedgerParty(customer);
    setModal("ledger");

    try {
      await dispatch(getCustomerLedger(id)).unwrap();
    } catch {}
  };

  const handleConfirmDelete = async () => {
    const id = selected?._id || selected?.id;
    if (!id) return;
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      setModal("");
      setSelected(null);

      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await refreshCustomers();
      }
    } catch (error) {
      console.log(error);
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
              Customers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>
          <button
            onClick={() => {
              setModal("add");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <span className="text-base">+</span> Add customer
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search records..."
                className="w-full sm:w-64 text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-600"
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
            <div className="text-xs text-slate-400 font-medium">
              {totalRecords} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative overflow-hidden">
              <table className="w-full text-left text-xs p-3 text-slate-600">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Name</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Phone</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Ledger</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-8 text-slate-400"
                      >
                        {loading
                          ? "Loading customers..."
                          : "No customers found."}
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr
                        key={customer._id || customer.id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {customer.name || "-"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                          {customer.phone || "-"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {customer.email || "-"}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${
                              customer.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenLedger(customer)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <ReceiptPoundSterling />
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenView(customer)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <View size={17} />
                            </button>
                            <button
                              onClick={() => {
                                setSelected(customer);
                                setModal("edit");
                              }}
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <NotebookPen size={15} />
                            </button>

                            <button
                              onClick={() => {
                                setSelected(customer);
                                setModal("delete");
                              }}
                              className="p-1 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {loading && customers.length > 0 && (
                <div className="absolute top-0 right-0 h-0.5 w-full overflow-hidden">
                  <div className="h-full w-1/3 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
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

      <CustomerFormModal
        isOpen={modal === "add" || modal === "edit"}
        onClose={() => {
          setModal("");
          setSelected(null);
        }}
        onSubmit={modal === "edit" ? handleUpdateCustomer : handleAddCustomer}
        initialData={modal === "edit" ? selected : null}
        title={modal === "edit" ? "Update Customer" : "Add Customer"}
        description={
          modal === "edit"
            ? "Update existing customer record details."
            : "Fill in the details to register a new customer."
        }
        submitText={modal === "edit" ? "Save Changes" : "Add Customer"}
        entityName="Customer"
      />

      <ViewCustomerModal
        customer={selectedViewCustomer}
        onClose={() => setSelectedViewCustomer(null)}
      />

      <LedgerModal
        isOpen={modal === "ledger"}
        onClose={() => {
          setModal("");
          setSelectedLedgerParty(null);
        }}
        party={selectedLedgerParty}
        partyType="customer"
        ledger={ledger}
        loading={ledgerLoading}
        error={ledgerError}
      />

      <DeleteModal
        isOpen={modal === "delete"}
        onClose={() => {
          setModal("");
          setSelected(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        itemName={selected?.name || ""}
        description="Are you sure you want to delete this customer record?"
      />
    </div>
  );
}
