import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Save, AlertCircle, Loader2 } from "lucide-react";

const AdditionForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = "Add category",
  description = "Fill in the details to save a new category.",
  submitText = "Save category",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    clearTimeout(timer.current);
    setFeedback(null);
    setSubmitting(false);

    let computedIsActive = true;

    if (typeof initialData?.isActive === "boolean") {
      computedIsActive = initialData.isActive;
    } else if (initialData?.status) {
      computedIsActive = initialData.status.toLowerCase() === "active";
    }

    setFormData({
      name: initialData?.name || "",
      description: initialData?.description || "",
      isActive: computedIsActive,
    });

    return () => clearTimeout(timer.current);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const getErrorMessage = (error) => {
    if (!error) return "Something went wrong. Please try again.";

    if (typeof error === "string") return error;

    if (Array.isArray(error)) {
      return error
        .map((item) => getErrorMessage(item))
        .filter(Boolean)
        .join(", ");
    }

    const candidates = [
      error.response?.data,
      error.payload,
      error.data,
      error.response,
      error.errors,
      error.error,
      error.message,
    ];

    for (const item of candidates) {
      if (item === undefined || item === null) continue;

      if (typeof item === "string" && item.trim()) {
        return item;
      }

      if (typeof item === "object") {
        const message = getErrorMessage(item);
        if (message) return message;
      }
    }

    if (error.request && !error.response) {
      return "Network error. Please check your internet connection.";
    }

    return "Something went wrong. Please try again.";
  };

  const showFeedback = (type, message, duration) => {
    clearTimeout(timer.current);
    setFeedback({ type, message });

    if (type === "success") {
      timer.current = setTimeout(() => {
        setFeedback(null);
        onClose();
      }, duration);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!formData.name.trim()) {
      showFeedback("error", "Name is required.", 3000);
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await onSubmit({
        ...formData,
        name: formData.name.trim(),
        status: formData.isActive ? "Active" : "Inactive",
      });

      if (!result) {
        throw new Error("Request failed. No successful response received.");
      }

      if (result.meta?.requestStatus === "rejected") {
        throw (
          result.payload ||
          result.error || {
            message: "Request failed",
          }
        );
      }

      if (result.meta && result.meta.requestStatus !== "fulfilled") {
        throw new Error("Request was not completed successfully.");
      }

      if (result.success === false) {
        throw result;
      }

      if (result.data?.success === false) {
        throw result.data;
      }

      showFeedback(
        "success",
        initialData ? "Updated successfully!" : "Created successfully!",
        1500,
      );
    } catch (error) {
      showFeedback("error", getErrorMessage(error), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {feedback && (
          <div
            role="alert"
            className={`absolute left-1/2 top-[68px] z-30 flex w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-white p-3 shadow-xl ${
              feedback.type === "success"
                ? "border-emerald-200 text-emerald-600"
                : "border-red-200 text-red-600"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={19} className="shrink-0" />
            ) : (
              <AlertCircle size={19} className="shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                {feedback.type === "success" ? "Success" : "Error"}
              </p>
              <p className="mt-0.5 break-words text-[11px]">
                {feedback.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                clearTimeout(timer.current);
                setFeedback(null);
              }}
              className="rounded-md p-1 transition hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white py-2">
          <div className="ml-3 min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900">
              {title}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-red-400 transition hover:text-red-500 disabled:opacity-40"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                disabled={submitting}
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className={`${inputClass} pl-9`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                disabled={submitting}
                placeholder="Enter description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={`${inputClass} resize-none pl-9`}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3">
              <div>
                <p className="text-xs font-semibold text-slate-700">Status</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Control availability
                </p>
              </div>

              <button
                type="button"
                role="switch"
                disabled={submitting}
                aria-checked={formData.isActive}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                  formData.isActive ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                    formData.isActive ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  formData.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <CheckCircle2 size={12} />
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {submitting ? "Saving..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdditionForm;
