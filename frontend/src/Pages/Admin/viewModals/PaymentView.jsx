import React from "react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
//
export default function ViewPaymentModal({ isOpen, onClose, payment }) {
  if (!isOpen || !payment) return null;
  const formatDate = useDateFormat();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Payment Details
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {payment.reference || "No Reference"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 text-xs bg-white">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Party Name</span>
            <span className="font-bold text-slate-800">{payment.party}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Direction</span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md ${
                payment.direction === "Received"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              {payment.direction}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Amount</span>
            <span className="font-bold text-blue-600 text-sm font-mono">
              PKR {payment.amount}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Payment Method</span>
            <span className="font-semibold text-slate-800">
              {payment.method}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Date</span>
            <span className="font-medium text-slate-700 font-mono">
              {formatDate(payment.date)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-1">
              Notes / Description
            </span>
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              {payment.notes || "No extra notes available."}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
