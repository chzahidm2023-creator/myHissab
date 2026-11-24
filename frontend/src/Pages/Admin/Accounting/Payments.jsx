import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import PaymentModal from "../Forms/PaymentForm";
import {
  addPartyPayment,
  getAllTransactions,
} from "../../../StoreAndHooks/slices/paymentSlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
//
export default function Payments() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const formatDate = useDateFormat();
  const {
    transactions = [],
    pagination = {},
    loading,
  } = useSelector((state) => state.payments || {});
  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};
  const itemsPerPage = Number(preferences.paginationLimit) || 10;
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";
  const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
  const totalRecords = Number(pagination.total) || 0;
  const updateParams = (page, searchValue = searchTerm) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    }
    setSearchParams(params);
  };

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      updateParams(totalPages, search);
    }
  }, [currentPage, totalPages]);
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAllTransactions({
          page: currentPage,
          search,
          partyType: "all",
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, currentPage, search, itemsPerPage]);

  const handleSavePayment = () => {
    setIsPaymentModalOpen(false);
    dispatch(
      getAllTransactions({
        page: currentPage,
        search,
        partyType: "all",
      }),
    );
  };

  const getDirection = (item) => {
    if (item.transactionType === "invoice") {
      return item.partyType === "customer"
        ? "Sales Invoice"
        : "Purchase Invoice";
    }

    if (item.partyType === "customer") {
      return item.direction === "credit" ? "Received" : "Paid out";
    }
    return item.direction === "debit" ? "Received" : "Paid out";
  };

  const settingsB = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settingsB.businessDetails || {};
  const currency = business.currency || "PKR";

  const formatMethod = (method) =>
    method ? method.charAt(0).toUpperCase() + method.slice(1) : "—";

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Payments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Money received, paid, and refunded.
            </p>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            + Record payment
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search reference or party..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  updateParams(1, value);
                }}
                className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              <div className="relative">
                <div className="relative ">
                  <div
                    className={`transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}
                  >
                    <div className="relative">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Date
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Party
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Party Type
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Direction
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Amount
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Method
                            </th>
                            <th className="px-5 py-3.5 whitespace-nowrap">
                              Reference
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {transactions.length > 0 ? (
                            transactions.map((item) => {
                              const direction = getDirection(item);

                              return (
                                <tr
                                  key={item._id}
                                  className="hover:bg-slate-50/80 transition-colors"
                                >
                                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                    {formatDate(
                                      item.paymentDate || item.createdAt,
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                                    {item.partyName}
                                  </td>
                                  <td className="px-5 py-3.5 capitalize whitespace-nowrap">
                                    {item.partyType}
                                  </td>
                                  <td className="px-5 py-3.5 whitespace-nowrap">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-md ${
                                        direction === "Received"
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                          : "bg-amber-50 text-amber-600 border border-amber-200"
                                      }`}
                                    >
                                      {direction}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-slate-900 font-mono whitespace-nowrap">
                                    {currency}{" "}
                                    {Number(item.amount || 0).toLocaleString(
                                      "en-PK",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                                    {formatMethod(item.paymentMethod)}
                                  </td>
                                  <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                                    {item.ref || "—"}
                                  </td>
                                </tr>
                              );
                            })
                          ) : !loading ? (
                            <tr>
                              <td
                                colSpan="7"
                                className="text-center py-16 text-slate-400 font-medium text-xs"
                              >
                                No payments found.
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="text-center py-16 text-slate-400"
                              >
                                Loading transactions...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {loading && transactions.length > 0 && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {totalRecords > 0 && (
            <Pagination
              totalItems={totalRecords}
              startIndex={(currentPage - 1) * itemsPerPage}
              currentItemsCount={Math.min(
                itemsPerPage,
                totalRecords - (currentPage - 1) * itemsPerPage,
              )}
              currentPage={currentPage}
              totalPages={totalPages}
              pages={Array.from({ length: totalPages }, (_, i) => i + 1)}
              onPageChange={updateParams}
              loading={loading}
            />
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        addPartyPayment={addPartyPayment}
        paymentData={null}
      />
    </div>
  );
}
