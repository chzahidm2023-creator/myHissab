import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  AlertCircle,
  X,
  Wallet,
  CalendarDays,
  CreditCard,
  FileText,
  Paperclip,
  Loader2,
} from "lucide-react";

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expenseData,
  loading = false,
  error: reduxError = null,
}) {
  const { categories = [] } = useSelector(
    (state) => state.categoriesExense || {},
  );

  const isEdit = Boolean(expenseData?._id);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setCategory(expenseData?.category?._id || expenseData?.category || "");
    setAmount(expenseData?.amount ?? "");
    setDate(
      expenseData?.date
        ? expenseData.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    );
    setMethod(expenseData?.method || "Cash");
    setDescription(expenseData?.description || "");
    setAttachment(null);
    setExistingAttachment(expenseData?.attachment || "");
    setError("");
  }, [expenseData, isOpen]);

  useEffect(() => {
    if (reduxError) setError(reduxError);
  }, [reduxError]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !amount || Number(amount) <= 0 || !date) {
      setError("Please fill all required fields correctly.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("amount", amount);
    formData.append("date", date);
    formData.append("method", method);
    formData.append("description", description);

    if (attachment) formData.append("attachment", attachment);

    await onSave(formData);
  };

  const fileName =
    attachment?.name ||
    existingAttachment.split(/[\\/]/).pop() ||
    "No file chosen";

  const inputClass =
    "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

  const labelClass = "mb-1.5 block text-[11px] font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wallet size={19} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isEdit ? "Update Expense" : "Add New Expense"}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {isEdit
                  ? "Edit your expense information"
                  : "Enter the details of your new expense"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-3">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}

          <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Expense Category *</label>
                <select
                  required
                  value={category}
                  disabled={loading}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Expense Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Enter amount"
                  disabled={loading}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>

              <div>
                <label className={labelClass}>Expense Date *</label>
                <input
                  type="date"
                  required
                  disabled={loading}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>

              <div>
                <label className={labelClass}>Payment Method *</label>
                <select
                  value={method}
                  disabled={loading}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`${inputClass} pl-8`}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                placeholder="Enter expense description..."
                disabled={loading}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className={labelClass}>Attachment</label>
              <div className="flex min-h-10 items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2">
                <Paperclip size={13} />
                Choose File
                <input
                  type="file"
                  disabled={loading}
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <span className="truncate text-[11px] text-slate-500">
                  {fileName}
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3">
          <p className="text-[10px] text-slate-400">* Required fields</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-form"
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  {isEdit ? "Update Expense" : "Save Expense"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
