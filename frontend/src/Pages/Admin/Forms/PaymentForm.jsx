import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerList } from "../../../StoreAndHooks/slices/customerSlice";
import { getSupplierList } from "../../../StoreAndHooks/slices/supplierSlice";

export default function PaymentModal({
  isOpen,
  onClose,
  onSave,
  addPartyPayment,
  paymentData,
}) {
  const dispatch = useDispatch();
  const { customers = [] } = useSelector((state) => state.customers || {});
  const { suppliers = [] } = useSelector((state) => state.suppliers || {});

  const [partyType, setPartyType] = useState("customer");
  const [partyId, setPartyId] = useState("");
  const [direction, setDirection] = useState("receive");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(getCustomerList({ status: "active" }));
      dispatch(getSupplierList({ status: "active" }));
      setError("");
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    setPartyType(paymentData?.partyType || "customer");
    setPartyId(paymentData?.partyId || "");
    setDirection(paymentData?.paymentType || "receive");
    setAmount(paymentData?.amount || "");
    setDate(
      paymentData?.paymentDate
        ? new Date(paymentData.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    );
    setMethod(paymentData?.paymentMethod || "cash");
    setReference(paymentData?.ref || "");
    setNotes(paymentData?.notes || "");
    setError("");
  }, [isOpen, paymentData]);

  if (!isOpen) return null;

  const parties = partyType === "customer" ? customers : suppliers;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!partyId || !amount || Number(amount) <= 0) {
      setError("Please select a party and enter a valid amount.");
      return;
    }

    if (!addPartyPayment) {
      setError("Payment API is not connected.");
      return;
    }

    const data = {
      partyType,
      partyId,
      paymentType: direction,
      amount: Number(amount),
      paymentMethod: method,
      paymentDate: date,
      ref: reference,
      notes,
    };

    try {
      setSaving(true);
      await dispatch(addPartyPayment(data)).unwrap();
      onSave();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Payment could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Record payment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record receipts, supplier payments, or return refunds.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 text-xs">
          <form
            id="record-payment-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Party type
                </label>
                <select
                  value={partyType}
                  onChange={(e) => {
                    setPartyType(e.target.value);
                    setPartyId("");
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Party
                </label>
                <select
                  required
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select {partyType}</option>
                  {parties.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="receive">Money received</option>
                  <option value="pay">Money paid out</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}
          </form>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-3 border-t border-slate-200">
          <button
            type="submit"
            form="record-payment-form"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save payment"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
