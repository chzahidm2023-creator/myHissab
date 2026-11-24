import React, { useState, useEffect } from "react";

export default function InvoiceReturnModal({
  isOpen,
  onClose,
  onSubmit,
  invoice = null,
  title,
  entityType = "sales",
}) {
  const [returnDate, setReturnDate] = useState("");
  const [reason, setReason] = useState("");
  const [returnItems, setReturnItems] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setReturnDate(today);

    if (invoice) {
      const itemsList =
        Array.isArray(invoice.itemList) && invoice.itemList.length > 0
          ? invoice.itemList
          : [
              {
                id: 1,
                name: invoice.items || "Wireless keyboard",
                invoiced: invoice.quantity || 10,
                alreadyReturned: invoice.alreadyReturned || 0,
                returnQuantity: 0,
              },
            ];

      setReturnItems(
        itemsList.map((item) => ({
          ...item,
          returnQuantity: item.returnQuantity || 0,
        })),
      );
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const handleQtyChange = (id, newQty) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxAllowed = item.invoiced - item.alreadyReturned;
          const parsedQty = parseInt(newQty) || 0;
          return {
            ...item,
            returnQuantity: Math.max(0, Math.min(parsedQty, maxAllowed)),
          };
        }
        return item;
      }),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      invoiceId: invoice.id,
      returnDate,
      reason,
      items: returnItems.filter((item) => item.returnQuantity > 0),
      entityType,
    };

    if (onSubmit) onSubmit(payload);
    onClose();
  };

  // CORRECT LOGIC:
  // Sabse pehle strict check karein ki kahin prop, entityType ya invoice me 'purchase' ya 'vendor/supplier' ka koi reference hai ya nahi.
  const isPurchase =
    (title && String(title).toLowerCase().includes("purchase")) ||
    (entityType && String(entityType).toLowerCase().includes("purchase")) ||
    (invoice &&
      String(invoice.type || "")
        .toLowerCase()
        .includes("purchase")) ||
    Boolean(invoice?.supplier) ||
    Boolean(invoice?.vendor);

  // Direct title priority, but if not given, evaluate strictly based on isPurchase

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
              {invoice.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-600 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 flex-1 text-xs">
          <form
            id="create-return-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* ROW 1: RETURN DATE & REASON */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Return date
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Enter reason for return..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {/* RETURN ITEMS TABLE */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Invoiced</th>
                      <th className="py-3 px-4 text-center">
                        Already returned
                      </th>
                      <th className="py-3 px-4 text-right sm:pr-8">
                        Return quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                          {item.invoiced}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                          {item.alreadyReturned}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <input
                            type="number"
                            min="0"
                            max={item.invoiced - item.alreadyReturned}
                            value={item.returnQuantity}
                            onChange={(e) =>
                              handleQtyChange(item.id, e.target.value)
                            }
                            className="w-24 text-center text-xs border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INFO TEXT FOOTER */}
            <p className="text-xs text-slate-500 leading-relaxed">
              Refund value includes the original invoice&apos;s proportional
              discount and tax. Cash refunds are recorded separately in
              Payments.
            </p>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-start space-x-2 shrink-0">
          <button
            type="submit"
            form="create-return-form"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Post return
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
