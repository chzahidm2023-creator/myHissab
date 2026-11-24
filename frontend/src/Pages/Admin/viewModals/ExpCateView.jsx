import React from "react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
// const formatDate = useDateFormat();
export default function ViewExpenseCategoryModal({
  isOpen,
  onClose,
  category,
}) {
  if (!isOpen || !category) return null;
  {
    formatDate(expense.date);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Category details
          </h2>
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
            <span className="text-slate-500 font-medium">Category Name</span>
            <span className="font-bold text-slate-800">{category.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 font-medium">Status</span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md ${
                category.active
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              {category.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block mb-1">
              Description
            </span>
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              {category.description || "No description provided."}
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
