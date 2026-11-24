import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function InvoiceForm({
  isOpen,
  onClose,
  onSubmit,
  title = "Create invoice",
  subtitle = "Add products, confirm payment, and post your invoice.",
  submitButtonText = "Save invoice",
  partyTypeLabel = "Customer",
  partyOptions = [],
  formData,
  onFieldChange,
  searchQuery = "",
  onSearchChange,
  sampleProducts = [],
  onAddItem,
  onQtyChange,
  onRemoveItem,
  subtotal = 0,
}) {
  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );

  const business = settings.businessDetails || {};
  const taxSettings = settings.invoicePreferences?.tax || {};
  const currency = business.currency || "PKR";

  const globalTaxRate = Math.max(
    0,
    Number(
      typeof taxSettings === "object"
        ? (taxSettings.rate ??
            taxSettings.taxRate ??
            taxSettings.percentage ??
            taxSettings.value ??
            0)
        : taxSettings,
    ) || 0,
  );

  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef(null);
  const money = (value) => Number(value || 0).toFixed(2);

  const discount = Math.max(0, Number(formData.discountAmount) || 0);
  const taxableAmount = Math.max(0, Number(subtotal) - discount);
  const taxAmount = Math.max(0, Number(formData.taxAmount) || 0);
  const currentTaxRate = taxableAmount
    ? Number(((taxAmount / taxableAmount) * 100).toFixed(2))
    : 0;
  const total = taxableAmount + taxAmount;
  const paid = Math.max(0, Number(formData.paidAmount) || 0);
  const balance = Math.max(0, total - paid);

  const getErrorMessage = (error) => {
    if (typeof error === "string") return error;

    const data =
      error?.response?.data || error?.data || error?.payload || error;

    if (typeof data === "string") return data;

    if (Array.isArray(data?.errors)) {
      return data.errors
        .map((item) => item.message || item.msg || item)
        .join(", ");
    }

    if (data?.errors && typeof data.errors === "object") {
      return Object.values(data.errors)
        .map((item) =>
          typeof item === "string" ? item : item?.message || String(item),
        )
        .join(", ");
    }

    return (
      data?.message ||
      data?.error ||
      error?.message ||
      "Something went wrong. Please try again."
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    clearTimeout(timer.current);
    setFeedback(null);
    setSubmitting(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const amount = Number(((taxableAmount * globalTaxRate) / 100).toFixed(2));

    onFieldChange("taxAmount", amount);
  }, [isOpen, taxableAmount, globalTaxRate]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  if (!isOpen) return null;

  const changeTaxAmount = (value) => {
    onFieldChange("taxAmount", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || feedback?.type === "success") return;

    clearTimeout(timer.current);
    setFeedback(null);
    setSubmitting(true);

    try {
      await onSubmit(e);

      setFeedback({
        type: "success",
        message: `${partyTypeLabel === "Supplier" ? "Purchase" : "Sale"} invoice saved successfully!`,
      });

      timer.current = setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 2000);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });

      timer.current = setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };
  const getProductPrice = (product) => {
    const isPurchase =
      partyTypeLabel?.toLowerCase() === "supplier" ||
      title?.toLowerCase().includes("purchase");

    return (
      Number(
        isPurchase
          ? (product.purchasePrice ?? product.price)
          : (product.salePrice ?? product.price),
      ) || 0
    );
  };
  const fieldClass =
    "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:opacity-70";

  const labelClass = "mb-1.5 block text-[11px] font-semibold text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Receipt size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-[10px] text-slate-500">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg p-2 text-red-400 transition hover:text-red-700 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {feedback && (
            <div
              role="alert"
              className={`absolute left-1/2 top-16 z-[60] flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
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
                className="rounded-md p-1 hover:bg-slate-100"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <form
            id="invoice-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3.5 lg:grid-cols-12"
          >
            <div className="space-y-3.5 lg:col-span-8">
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{partyTypeLabel}</label>
                  <select
                    value={formData.party || ""}
                    disabled={submitting}
                    onChange={(e) => onFieldChange("party", e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select {partyTypeLabel}</option>
                    {partyOptions.map((opt, idx) => {
                      const value =
                        typeof opt === "object" ? opt.value || opt._id : opt;
                      const label =
                        typeof opt === "object" ? opt.label || opt.name : opt;

                      return (
                        <option key={value || idx} value={value || ""}>
                          {label || ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Invoice date</label>
                  <input
                    type="date"
                    value={formData.date || ""}
                    disabled={submitting}
                    onChange={(e) => onFieldChange("date", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={15} className="text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800">
                    Invoice items
                  </h4>
                  <span className="ml-auto rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                    {formData.items?.length || 0} Items
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product name, SKU, or barcode..."
                    value={searchQuery}
                    disabled={submitting}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={fieldClass}
                  />

                  {searchQuery && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                      {sampleProducts.length > 0 ? (
                        sampleProducts.map((product) => (
                          <button
                            type="button"
                            key={product.id || product._id}
                            disabled={submitting}
                            onClick={() =>
                              onAddItem({
                                ...product,
                                price: getProductPrice(product),
                              })
                            }
                            className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-blue-50/50"
                          >
                            <span className="min-w-0 truncate text-xs font-medium text-slate-700">
                              {product.name}{" "}
                              <span className="text-slate-400">
                                ({product.sku})
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-bold text-blue-600">
                              {currency} {money(getProductPrice(product))}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-center text-xs text-slate-400">
                          No products found
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {formData.items?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-semibold uppercase text-slate-400">
                        <tr>
                          <th className="whitespace-nowrap p-2.5">Product</th>
                          <th className="whitespace-nowrap p-2.5 text-center">
                            Qty
                          </th>
                          <th className="whitespace-nowrap p-2.5 text-right">
                            Price
                          </th>
                          <th className="whitespace-nowrap p-2.5 text-right">
                            Total
                          </th>
                          <th className="p-2.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.items.map((item, idx) => {
                          const id = item.productId || item.product || item.id;

                          return (
                            <tr
                              key={id || idx}
                              className="hover:bg-slate-50/70"
                            >
                              <td className="whitespace-nowrap p-2.5 font-medium text-slate-700">
                                {item.name || item.productName}
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  disabled={submitting}
                                  onChange={(e) =>
                                    onQtyChange(id, e.target.value)
                                  }
                                  className="h-7 w-14 rounded-md border border-slate-200 px-1 text-center text-xs outline-none focus:border-blue-500"
                                />
                              </td>
                              <td className="whitespace-nowrap p-2.5 text-right text-slate-500">
                                {money(item.price)}
                              </td>
                              <td className="whitespace-nowrap p-2.5 text-right font-semibold text-slate-800">
                                {money(
                                  Number(item.price || 0) *
                                    Number(item.quantity || 0),
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => onRemoveItem(id)}
                                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-7 text-center">
                    <ShoppingCart
                      size={22}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-xs font-medium text-slate-500">
                      No products added
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Search and select products to create invoice
                    </p>
                  </div>
                )}

                <div>
                  <label className={labelClass}>Notes / Reference</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ""}
                    disabled={submitting}
                    onChange={(e) => onFieldChange("notes", e.target.value)}
                    placeholder="Add invoice notes..."
                    className="w-full resize-none rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
                <h4 className="border-b border-slate-100 pb-3 text-xs font-bold text-slate-800">
                  Payment summary
                </h4>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">
                    {money(subtotal)}
                  </span>
                </div>

                <div>
                  <label className={labelClass}>Discount amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountAmount ?? 0}
                    disabled={submitting}
                    onChange={(e) =>
                      onFieldChange("discountAmount", e.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-2.5 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Tax settings
                    </label>
                    <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                      Global rate: {globalTaxRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-blue-100 pb-2 text-[11px]">
                    <span className="text-slate-500">Current tax rate</span>
                    <span className="font-bold text-blue-700">
                      {currentTaxRate.toFixed(2)}%
                    </span>
                  </div>

                  <div>
                    <label className={labelClass}>Tax amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.taxAmount ?? 0}
                      disabled={submitting}
                      onChange={(e) => changeTaxAmount(e.target.value)}
                      className={fieldClass}
                    />
                  </div>

                  <div className="flex justify-between border-t border-blue-100 pt-2 text-[10px]">
                    <span className="text-slate-500">
                      Taxable amount after discount
                    </span>
                    <span className="font-semibold text-slate-700">
                      {money(taxableAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Discount</span>
                  <span>{money(discount)}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tax amount</span>
                  <span>{money(taxAmount)}</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-800">
                    Grand total
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {money(total)}
                  </span>
                </div>

                <div>
                  <label className={labelClass}>Payment method</label>
                  <select
                    value={formData.paymentMethod || "Cash"}
                    disabled={submitting}
                    onChange={(e) =>
                      onFieldChange("paymentMethod", e.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Paid amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paidAmount ?? 0}
                    disabled={submitting}
                    onChange={(e) =>
                      onFieldChange("paidAmount", e.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div className="flex justify-between rounded-lg bg-slate-50 p-2.5">
                  <span className="text-xs font-semibold text-slate-600">
                    Remaining balance
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      balance > 0 ? "text-orange-600" : "text-emerald-600"
                    }`}
                  >
                    {money(balance)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="invoice-form"
                  disabled={submitting || feedback?.type === "success"}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : feedback?.type === "success" ? (
                    <>
                      <CheckCircle2 size={14} />
                      Saved successfully
                    </>
                  ) : (
                    submitButtonText
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
