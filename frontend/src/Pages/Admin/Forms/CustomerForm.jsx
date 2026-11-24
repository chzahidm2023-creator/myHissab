import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Wallet,
  CreditCard,
  AlertCircle,
  Loader2,
  Check,
  CheckCircle2,
} from "lucide-react";

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = "Add Customer",
  description = "Fill in the details to save the record.",
  submitText = "Save customer",
  entityName = "Customer",
}) {
  const getDefaultFormData = () => ({
    name: "",
    phone: "",
    email: "",
    address: "",
    openingBalance: "0",
    creditLimit: "0",
    isActive: true,
  });

  const [formData, setFormData] = useState(getDefaultFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    clearTimeout(timerRef.current);
    setFieldErrors({});
    setToast(null);
    setSubmitting(false);

    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        address: initialData.address ?? "",
        openingBalance: initialData.openingBalance ?? "0",
        creditLimit: initialData.creditLimit ?? "0",
        isActive:
          typeof initialData.isActive === "boolean"
            ? initialData.isActive
            : true,
      });
    } else {
      setFormData(getDefaultFormData());
    }

    return () => clearTimeout(timerRef.current);
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!isOpen) return null;

  const showMessage = (type, message, duration) => {
    clearTimeout(timerRef.current);
    setToast({ type, message });

    timerRef.current = setTimeout(() => {
      setToast(null);
      if (type === "success") onClose();
    }, duration);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    setToast(null);
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setFieldErrors({});
    setToast(null);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      openingBalance: Number(formData.openingBalance || 0),
      creditLimit: Number(formData.creditLimit || 0),
      isActive: formData.isActive,
    };

    setSubmitting(true);

    try {
      await onSubmit(payload);
      showMessage("success", `${entityName} saved successfully`, 2000);
    } catch (error) {
      const backendError =
        error?.errors ||
        error?.payload?.errors ||
        error?.response?.data?.errors ||
        {};

      const message =
        error?.message ||
        error?.payload?.message ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setFieldErrors(backendError);
      showMessage("error", message, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
    }`;

  const labelClass = "mb-1.5 block text-[11px] font-semibold text-slate-600";

  const renderError = (field) =>
    fieldErrors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-500">
        <AlertCircle size={11} />
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl">
        {toast && (
          <div
            className={`absolute left-1/2 top-4 z-[60] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-600"
                : "border-red-200 bg-white text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={19} className="shrink-0" />
            ) : (
              <AlertCircle size={19} className="shrink-0" />
            )}
            <p className="flex-1 text-xs font-semibold">{toast.message}</p>
            <button
              type="button"
              onClick={() => {
                clearTimeout(timerRef.current);
                setToast(null);
              }}
              className="rounded-md p-1 hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-2 py-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <UserRound size={17} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>
            <p className="ml-11 mt-0.5 text-[11px] text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-red-400 transition hover:text-red-600 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <form
            id="reusable-entity-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Basic Information
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    {entityName} Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserRound
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder={`Enter ${entityName.toLowerCase()} name`}
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass("name")}
                    />
                  </div>
                  {renderError("name")}
                </div>

                <div>
                  <label className={labelClass}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClass("phone")}
                    />
                  </div>
                  {renderError("phone")}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="example@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass("email")}
                    />
                  </div>
                  {renderError("email")}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Address</label>
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <textarea
                      name="address"
                      rows={2}
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`${inputClass("address")} resize-none`}
                    />
                  </div>
                  {renderError("address")}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  Account Details
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Opening Balance</label>
                  <div className="relative">
                    <Wallet
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      name="openingBalance"
                      min="0"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={handleChange}
                      className={inputClass("openingBalance")}
                    />
                  </div>
                  {renderError("openingBalance")}
                </div>

                <div>
                  <label className={labelClass}>Credit Limit</label>
                  <div className="relative">
                    <CreditCard
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      name="creditLimit"
                      min="0"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={handleChange}
                      className={inputClass("creditLimit")}
                    />
                  </div>
                  {renderError("creditLimit")}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {entityName} Status
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Control whether this record is active
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={handleStatusToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  formData.isActive ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>

              <span
                className={`min-w-14 text-right text-[11px] font-bold ${
                  formData.isActive ? "text-blue-600" : "text-slate-500"
                }`}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
          <p className="text-[10px] text-slate-400">
            <span className="text-red-500">*</span> Required fields
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="reusable-entity-form"
              disabled={submitting}
              className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  {submitText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
