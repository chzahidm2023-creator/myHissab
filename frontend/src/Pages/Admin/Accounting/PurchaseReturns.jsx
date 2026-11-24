import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  Search,
  RotateCcw,
  FileText,
  CalendarDays,
  ArrowUpDown,
  Package,
  UserRound,
  RefreshCw,
} from "lucide-react";
import {
  getAllPurchaseReturns,
  getPurchaseInvoiceById,
  clearCurrentPurchaseInvoice,
} from "../../../StoreAndHooks/slices/purchaseInvSlice";
import ViewInvoiceModal from "../viewModals/InvoiceModal";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import Pagination from "../../../components/Pagination";
export default function PurchaseReturns() {
  const formatDate = useDateFormat();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    returns = [],
    returnsLoading,
    returnsCurrentPage = 1,
    returnsTotalPages = 1,
    totalReturns = 0,
    currentInvoice,
    detailsLoading,
  } = useSelector((state) => state.purchaseInvoice);
  const settingsB = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settingsB.businessDetails || {};
  const currency = business.currency || "PKR";

  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};
  const paginationLimit = Number(preferences.paginationLimit) || 10;
  const defaultPeriod = preferences.defaultPeriod || "all";

  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const totalPages = Math.max(1, Number(returnsTotalPages) || 1);

  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAllPurchaseReturns({
          search: search.trim(),
          page,
          limit: paginationLimit,
          period: defaultPeriod,
          ...(defaultPeriod === "custom" && {
            startDate: preferences.customStartDate?.slice(0, 10),
            endDate: preferences.customEndDate?.slice(0, 10),
          }),
          sortBy,
          sortOrder,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    search,
    page,
    paginationLimit,
    defaultPeriod,
    preferences.customStartDate,
    preferences.customEndDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      updateParams({ page: totalPages });
    }
  }, [page, totalPages]);

  const updateParams = (values) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(values).forEach(([key, value]) => {
          params.set(key, String(value));
        });
        return params;
      },
      { replace: true },
    );
  };

  const handleViewInvoice = async (invoiceId) => {
    if (!invoiceId) {
      alert("Original invoice ID not found.");
      return;
    }

    dispatch(clearCurrentPurchaseInvoice());
    setShowViewModal(true);

    try {
      await dispatch(getPurchaseInvoiceById(invoiceId)).unwrap();
    } catch (error) {
      setShowViewModal(false);
    }
  };

  const handleCloseView = () => {
    setShowViewModal(false);
    dispatch(clearCurrentPurchaseInvoice());
  };

  const handleSort = (field) => {
    updateParams({
      sortBy: field,
      sortOrder: sortBy === field && sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    });
  };

  const handleReset = () => {
    setSearchParams({
      page: "1",
      limit: String(paginationLimit),
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const startIndex = returns.length ? (page - 1) * paginationLimit + 1 : 0;
  const endIndex = returns.length ? startIndex + returns.length - 1 : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Purchase returns
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage returned items and vendor credit amounts.
            </p>
          </div>
          <NavLink
            to="/dashboard/purchases"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} /> Select an invoice to return
          </NavLink>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search return or invoice number..."
                value={search}
                onChange={(e) =>
                  updateParams({ search: e.target.value, page: 1 })
                }
                className="w-full text-xs pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
              />
            </div>
            <button
              onClick={handleReset}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              {returnsLoading && returns.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-10 h-0.5 overflow-hidden bg-blue-100">
                  <div className="h-full w-1/3 bg-blue-600 animate-[loading_1s_ease-in-out_infinite]" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleSort("returnList.returnInvoiceNumber")
                          }
                          className="inline-flex items-center gap-1.5 hover:text-blue-600"
                        >
                          Return # <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleSort("returnList.returnDate")}
                          className="inline-flex items-center gap-1.5 hover:text-blue-600"
                        >
                          Date <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="px-5 py-3.5 whitespace-nowrap">
                        Original invoice
                      </th>
                      <th className="px-5 py-3.5 whitespace-nowrap">
                        Supplier
                      </th>
                      <th className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSort("returnList.returnAmount")}
                          className="inline-flex items-center gap-1.5 hover:text-blue-600"
                        >
                          Credit amount <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="px-5 py-3.5 whitespace-nowrap">
                        Returned items
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {returns.length ? (
                      returns.map((item, index) => (
                        <tr
                          key={item._id || item.returnInvoiceNumber || index}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-bold text-blue-600 font-mono whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <RotateCcw size={14} />
                              {item.returnInvoiceNumber || "-"}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />
                              {formatDate(item.returnDate)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-800 font-medium font-mono whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleViewInvoice(item.originalInvoiceId)
                              }
                              className="flex items-center gap-2 whitespace-nowrap hover:text-blue-600 transition-colors"
                            >
                              <FileText size={14} className="text-slate-400" />
                              {item.originalPurchaseInvoiceNumber || "-"}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <UserRound size={14} className="text-slate-400" />
                              {item.supplier?.name || "-"}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                            {currency} {formatAmount(item.returnAmount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col gap-1.5 min-w-52">
                              {item.returnedItems?.length
                                ? item.returnedItems.map((product, i) => (
                                    <div
                                      key={product._id || i}
                                      className="flex items-center gap-1.5 text-slate-600 whitespace-nowrap"
                                    >
                                      <Package
                                        size={13}
                                        className="text-slate-400 shrink-0"
                                      />
                                      <span>
                                        {product.productName ||
                                          product.product?.name ||
                                          "Product"}
                                        <span className="text-slate-400 ml-1">
                                          × {product.quantity}
                                        </span>
                                      </span>
                                    </div>
                                  ))
                                : "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : returnsLoading ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center">
                          <RefreshCw
                            size={22}
                            className="animate-spin text-blue-600 mx-auto"
                          />
                          <span className="text-xs text-slate-400 mt-2 block">
                            Loading returns...
                          </span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <RotateCcw size={28} />
                            <span className="font-medium text-xs">
                              No purchase returns found.
                            </span>
                            <span className="text-[11px]">
                              Try another search or create a new return.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Pagination
            totalItems={totalReturns || 0}
            startIndex={startIndex}
            currentItemsCount={endIndex - startIndex + 1}
            currentPage={returnsCurrentPage || page}
            totalPages={totalPages}
            onPageChange={(newPage) => updateParams({ page: newPage })}
            loading={returnsLoading}
          />
        </div>
      </div>

      {showViewModal && (
        <ViewInvoiceModal
          isOpen={showViewModal}
          invoice={currentInvoice}
          loading={detailsLoading}
          onClose={handleCloseView}
          title="Purchase invoice"
        />
      )}
    </div>
  );
}
