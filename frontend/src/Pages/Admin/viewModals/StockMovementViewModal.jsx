import React from "react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
// const formatDate = useDateFormat();
export default function ViewStockMovementModal({ movement, onClose }) {
  if (!movement) return null;
  const formatDate = useDateFormat();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* FULL MODAL SCROLL CONTAINER */}
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              Stock Movement Detail
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {formatDate(movement.product)}
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

        {/* BODY */}
        <div className="p-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {movement.date || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Reference
              </p>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {movement.reference || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Movement Type
              </p>
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700">
                {movement.type}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Quantity Change
              </p>
              <span
                className={`text-sm font-bold ${
                  Number(movement.change) < 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {movement.change > 0 ? `+${movement.change}` : movement.change}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Balance After
              </p>
              <p className="text-sm font-bold text-slate-900">
                {movement.balanceAfter} units
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-end sticky bottom-0 z-10">
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
  );
}
