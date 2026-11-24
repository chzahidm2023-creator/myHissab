import { X } from "lucide-react";
import React from "react";

export default function ViewCategoryModal({ addValue, onClose, onEdit }) {
  if (!addValue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* FULL MODAL CONTAINER WITH SCROLL */}
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
              Category Details
            </span>
            <h5 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {addValue.name}
            </h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-600 text-xl font-bold"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Category Name
              </p>
              <p className="text-sm font-bold text-slate-900">
                {addValue.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Active Status
              </p>
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${
                  addValue.status === "Active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {addValue.status || "Active"}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                Description
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {addValue.description ||
                  "No description provided for this addValue."}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 sticky bottom-0 z-10">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(addValue);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
            className="px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 active:red-black rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
