import React from "react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";

export default function ViewCustomerModal({
  customer,
  onClose,
  onEdit,
  onViewLedger,
  entityName = "Customer",
}) {
  if (!customer) return null;

  const formatDate = useDateFormat();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* MAIN CONTAINER WITH FULL MODAL SCROLL */}
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              {entityName} Details
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {customer.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 space-y-6">
          {/* FIELDS CARD (LAYOUT MATCHING THE IMAGE) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Name
              </p>
              <p className="text-sm font-bold text-slate-900">
                {customer.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Phone
              </p>
              <p className="text-sm font-bold text-slate-900">
                {customer.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Email
              </p>
              <p className="text-xs font-bold text-slate-900">
                {customer.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Address
              </p>
              <p className="text-xs font-bold text-slate-900">
                {customer.address || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Opening balance
              </p>
              <p className="text-xs font-bold text-slate-900">
                {parseFloat(customer.openingBalance || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Credit limit
              </p>
              <p className="text-xs font-bold text-slate-900">
                {parseFloat(customer.creditLimit || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Status
              </p>
              <p className="text-xs font-bold text-slate-900">
                {customer.isActive == true ? "Active" : "inActive"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div>
            <button
              type="button"
              onClick={() => {
                if (onViewLedger) onViewLedger(customer);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              View ledger & balance
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit record
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
