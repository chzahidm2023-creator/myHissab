import React, { useState, useEffect } from "react";

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  productsList = [],
  title = "Adjust stock",
  description = "Every adjustment is recorded in stock movement history.",
  submitText = "Post adjustment",
}) {
  const [formData, setFormData] = useState({
    productId: "",
    adjustmentType: "Increase", // "Increase" (+), "Decrease" (-)
    quantity: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId || "",
        adjustmentType: initialData.adjustmentType || "Increase",
        quantity: initialData.quantity || "",
        reason: initialData.reason || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        productId: productsList[0]?.id || "",
        adjustmentType: "Increase",
        quantity: "",
        reason: "",
        notes: "",
      });
    }
  }, [initialData, isOpen, productsList]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.productId ||
      !formData.quantity ||
      Number(formData.quantity) <= 0
    )
      return;

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* FULL MODAL CONTAINER WITH SCROLL */}
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* BODY FORM */}
        <div className="p-6">
          <form
            id="stock-adjust-form"
            onSubmit={handleSubmit}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Product & current quantity{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all truncate"
                >
                  <option value="" disabled>
                    Select product...
                  </option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} &middot; {p.stock} in stock
                    </option>
                  ))}
                </select>
              </div>

              {/* ADJUSTMENT TYPE */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Adjustment type
                </label>
                <select
                  value={formData.adjustmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, adjustmentType: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                >
                  <option value="Increase">Increase</option>
                  <option value="Decrease">Decrease</option>
                </select>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity..."
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {/* ROW 2: REASON & NOTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* REASON */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Enter reason..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Enter notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 bg-white px-6 py-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="stock-adjust-form"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
