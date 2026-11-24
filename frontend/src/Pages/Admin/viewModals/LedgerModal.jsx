import React from "react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import { useDispatch, useSelector } from "react-redux";
export default function LedgerModal({
  isOpen,
  onClose,
  party,
  partyType,
  ledger = [],
  loading,
  error,
}) {
  if (!isOpen || !party) return null;
  const formatDate = useDateFormat();
  const account = ledger?.[partyType] || ledger || {};
  const transactions = account.transactions || [];
  const isSupplier = partyType === "supplier";

  const openingBalance = Number(
    account.openingBalance ?? party.openingBalance ?? 0,
  );
  const closingBalance = Number(
    account.closingReceivable ??
      account.closingPayable ??
      party.closingBalance ??
      0,
  );
  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settings.businessDetails || {};
  const invoicePreferences = settings.invoicePreferences || {};
  const currency = business.currency || "PKR";
  const footer =
    invoicePreferences.invoiceFooter || "Thank you for your business.";

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {party.name || "-"}
              </h2>
              <span className="text-[10px] font-semibold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                {partyType} ledger
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {party.phone || "-"} <span className="mx-1">•</span>{" "}
              {party.email || "-"}
            </p>
            {party.address && (
              <p className="text-[11px] text-slate-400">{party.address}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <span>↗</span> Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-medium text-slate-500">
              Opening Balance
            </p>
            <h3 className="text-xl font-bold text-slate-800 mt-1 tabular-nums">
              {formatAmount(openingBalance)} {currency}
            </h3>
          </div>

          <div
            className={`rounded-lg border p-4 ${
              closingBalance > 0
                ? "bg-blue-50 border-blue-100"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p className="text-[11px] font-medium text-slate-500">
              {isSupplier ? "Closing Payable" : "Closing Receivable"}
            </p>
            <h3
              className={`text-xl font-bold mt-1 tabular-nums ${
                closingBalance > 0 ? "text-blue-700" : "text-slate-800"
              }`}
            >
              {formatAmount(closingBalance)} {currency}
            </h3>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Transaction History
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Complete account activity
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {transactions.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs table-fixed">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="w-[18%] px-4 py-3 font-semibold align-middle">
                      Date
                    </th>
                    <th className="w-[34%] px-4 py-3 font-semibold align-middle">
                      Reference
                    </th>
                    <th className="w-[16%] px-4 py-3 font-semibold text-right align-middle">
                      Debit
                    </th>
                    <th className="w-[16%] px-4 py-3 font-semibold text-right align-middle">
                      Credit
                    </th>
                    <th className="w-[16%] px-4 py-3 font-semibold text-right align-middle">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-slate-400"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <tr
                        key={transaction._id || index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 align-middle">
                          {formatDate(
                            transaction.paymentDate || transaction.date,
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 truncate align-middle">
                          {transaction.ref || transaction.notes || "-"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-red-600 align-middle">
                          {formatAmount(transaction.debit)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600 align-middle">
                          {formatAmount(transaction.credit)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums align-middle">
                          {formatAmount(transaction.runningBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-slate-400"
                      >
                        No transaction history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
              Showing {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
