import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function InvoiceReturnModal({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  title,
  entityType,
}) {
  const [returnDate, setReturnDate] = useState(getToday());
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const items = useMemo(() => {
    return (invoice?.items || []).map((item, index) => {
      const productId = String(
        item.product?._id ||
          item.product?.id ||
          item.product ||
          item.productId ||
          item.id ||
          "",
      );

      const alreadyReturned = (invoice?.returnList || []).reduce(
        (total, ret) =>
          total +
          (ret.returnedItems || []).reduce(
            (sum, returned) =>
              String(returned.product?._id || returned.product) === productId
                ? sum + Number(returned.quantity || 0)
                : sum,
            0,
          ),
        0,
      );

      return {
        key: productId || String(item._id || index),
        productId,
        name: item.productName || item.name || item.product?.name || "Product",
        quantity: Number(item.quantity || 0),
        alreadyReturned,
        price: Number(item.price || 0),
      };
    });
  }, [invoice]);

  const selectedItems = items
    .map((item) => ({
      ...item,
      returnQuantity: Number(quantities[item.key] || 0),
    }))
    .filter((item) => item.returnQuantity > 0);

  const subtotal = Number(invoice?.subtotal || 0);
  const discount = Number(invoice?.discountAmount || 0);
  const tax = Number(invoice?.taxAmount || 0);

  const returnGross = selectedItems.reduce(
    (sum, item) => sum + item.price * item.returnQuantity,
    0,
  );

  const returnAmount =
    subtotal > 0
      ? returnGross -
        (returnGross / subtotal) * discount +
        (returnGross / subtotal) * tax
      : returnGross;

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedItems.length)
      return showError("Please enter return quantity.");

    const invalidItem = selectedItems.find(
      (item) =>
        !item.productId ||
        item.returnQuantity <= 0 ||
        item.returnQuantity > item.quantity - item.alreadyReturned,
    );

    if (invalidItem)
      return showError(
        `Invalid quantity for ${invalidItem.name}. Available: ${
          invalidItem.quantity - invalidItem.alreadyReturned
        }`,
      );

    try {
      setLoading(true);

      await onSubmit({
        invoiceId: invoice._id || invoice.id,
        returnDate,
        reason,
        returnAmount: Number(returnAmount.toFixed(2)),
        items: selectedItems.map((item) => ({
          product: item.productId,
          quantity: item.returnQuantity,
        })),
      });

      setQuantities({});
      setReason("");
      onClose();
    } catch (error) {
      showError(
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-3 sm:p-5">
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v6h6M20 20v-6h-6M5 9a7 7 0 0112-3l3 4M19 15a7 7 0 01-12 3l-3-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                  {title || "Create Return"}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Invoice: {invoice.invoiceNumber || invoice.id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-red-400 hover:text-red-700"
            >
              X
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-between gap-3 border border-red-400 border-l-4 border-l-red-500 rounded-md bg-red-50 px-3 py-2 m-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-red-600 text-sm font-semibold">
                  Error:
                </span>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-500 text-lg font-bold"
              >
                <X />
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                  RETURN DATE
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                  RETURN REASON
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Return Products
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Select quantity for each product
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                  {items.length} Items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full  text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-3 py-3 text-center">Invoiced</th>
                      <th className="px-3 py-3 text-center">Returned</th>
                      <th className="px-4 py-3 text-center">Return Qty</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const available = Math.max(
                        0,
                        item.quantity - item.alreadyReturned,
                      );

                      return (
                        <tr key={item.key} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-slate-700">
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              PKR {formatAmount(item.price)} / unit
                            </p>
                          </td>

                          <td className="px-3 py-3 text-center text-xs text-slate-600">
                            {item.quantity}
                          </td>

                          <td className="px-3 py-3 text-center text-xs text-slate-500">
                            {item.alreadyReturned}
                          </td>

                          <td className="px-4 py-3">
                            <div className="mx-auto max-w-[100px]">
                              <input
                                type="number"
                                min="0"
                                max={available}
                                step="0.01"
                                value={quantities[item.key] ?? 0}
                                disabled={!available}
                                onChange={(e) =>
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [item.key]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-40"
                              />
                              <p className="mt-1 text-center text-[9px] text-slate-400">
                                Max: {available}
                              </p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!items.length && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No products found in this invoice.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Total Return Quantity
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {selectedItems.reduce(
                    (sum, item) => sum + item.returnQuantity,
                    0,
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Total Refund Amount
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">
                  PKR {formatAmount(returnAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !selectedItems.length}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Post Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
