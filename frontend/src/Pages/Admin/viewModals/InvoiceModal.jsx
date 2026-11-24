import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InvoiceReturnModal from "../Forms/ReturnForm";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import {
  createSaleReturn,
  getSaleInvoiceById,
} from "../../../StoreAndHooks/slices/saleInvoiceSlice";
import {
  returnPurchaseInvoice,
  getPurchaseInvoiceById,
} from "../../../StoreAndHooks/slices/purchaseInvSlice";

export default function ViewInvoiceModal({ invoice, onClose, title }) {
  const formatDate = useDateFormat();
  const dispatch = useDispatch();
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settings.businessDetails || {};
  const invoicePreferences = settings.invoicePreferences || {};
  const currency = business.currency || "PKR";
  const footer =
    invoicePreferences.invoiceFooter || "Thank you for your business.";

  if (!invoice) return null;

  const isPurchase =
    String(title || "")
      .toLowerCase()
      .includes("purchase") || Boolean(invoice.supplier || invoice.vendor);

  const party = isPurchase
    ? invoice.supplier || invoice.vendor || {}
    : invoice.customer || {};

  const items = invoice.items || [];
  const returnsList = invoice.returnList || [];

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleReturnSubmit = async (returnData) => {
    try {
      if (isPurchase) {
        await dispatch(
          returnPurchaseInvoice({
            id: invoice._id,
            formData: returnData,
          }),
        ).unwrap();
        await dispatch(getPurchaseInvoiceById(invoice._id)).unwrap();
      } else {
        await dispatch(
          createSaleReturn({
            ...returnData,
            invoiceId: invoice._id,
          }),
        ).unwrap();
        await dispatch(getSaleInvoiceById(invoice._id)).unwrap();
      }
      setIsReturnModalOpen(false);
    } catch (error) {
      console.log("Return Error:", error);
    }
  };

  const handlePrint = () => {
    const content = document.getElementById("printable-invoice");
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoice.invoiceNumber || "Invoice"}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 12mm; }
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body class="p-4">
          <div class="max-w-3xl mx-auto">${content.innerHTML}</div>
          <script>
            window.onload = () => setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const Info = ({ label, value }) => (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4">
        <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC] shadow-2xl">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {title || "Invoice Details"}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {invoice.invoiceNumber} <span className="mx-1">•</span>{" "}
                {formatDate(invoice.invoiceDate)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handlePrint}
                className="rounded-md border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Print
              </button>
              <button
                onClick={handlePrint}
                className="rounded-md border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Download PDF
              </button>
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="rounded-md bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-blue-700"
              >
                + Create Return
              </button>
              <button
                onClick={onClose}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5">
            <div
              id="printable-invoice"
              className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  {business.logo && (
                    <img
                      src={business.logo}
                      alt="Business logo"
                      className="mb-2 max-h-16 max-w-36 object-contain"
                    />
                  )}
                  <h4 className="text-base font-bold text-slate-800">
                    {business.businessName || "My Business"}
                  </h4>
                  <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                    {business.phone && <p>{business.phone}</p>}
                    {business.email && <p>{business.email}</p>}
                    {business.address && <p>{business.address}</p>}
                    {business.website && <p>{business.website}</p>}
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400">
                    INVOICE SUMMARY
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatDate(invoice.invoiceDate)}
                  </p>
                  <span className="mt-2 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-emerald-700">
                    {invoice.paymentStatus || "Posted"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isPurchase ? "Supplier Information" : "Customer Information"}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Info label="Name" value={party.name} />
                  <Info label="Phone" value={party.phone} />
                  <Info label="Email" value={party.email} />
                  <Info label="Address" value={party.address} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800">
                    Invoice Items
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    {items.length} Products
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[560px] table-fixed text-left text-xs">
                    <colgroup>
                      <col className="w-[40%]" />
                      <col className="w-[15%]" />
                      <col className="w-[22%]" />
                      <col className="w-[23%]" />
                    </colgroup>
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        <th className="px-3 py-3 text-left">Product</th>
                        <th className="px-3 py-3 text-center">Qty</th>
                        <th className="px-3 py-3 text-right">Unit Price</th>
                        <th className="px-3 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr
                          key={item._id || item.product?._id}
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-3 py-3 text-left">
                            <p className="truncate font-semibold text-slate-700">
                              {item.product?.name ||
                                item.productName ||
                                "Product"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {item.product?.sku || "-"}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                            {formatAmount(item.price)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">
                            {formatAmount(item.total)}
                          </td>
                        </tr>
                      ))}
                      {!items.length && (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-6 text-center text-xs text-slate-400"
                          >
                            No invoice items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 border-t border-slate-100 pt-4 sm:flex-row">
                <p className="max-w-xs whitespace-pre-line text-[11px] text-slate-400">
                  {footer}
                </p>
                <div className="w-full space-y-2 sm:max-w-[270px]">
                  {[
                    ["Subtotal", invoice.subtotal],
                    ["Discount", invoice.discountAmount],
                    ["Tax", invoice.taxAmount],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between text-xs text-slate-500"
                    >
                      <span>{label}</span>
                      <span className="font-semibold tabular-nums text-slate-700">
                        {formatAmount(value)}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs font-bold text-slate-800">
                      Grand Total
                    </span>
                    <span className="text-base font-bold tabular-nums text-blue-600">
                      {formatAmount(invoice.grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-dashed border-slate-200 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Paid Amount</span>
                      <span className="font-semibold text-slate-700">
                        {formatAmount(invoice.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Returns</span>
                      <span className="font-semibold text-red-600">
                        {formatAmount(invoice.returns)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-bold text-slate-700">
                        Remaining Balance
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatAmount(invoice.remainingAmount)}
                      </span>
                    </div>
                  </div>
                  <p className="text-right text-[9px] text-slate-400">
                    Currency: {currency}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-800">
                      Return History
                    </h5>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-600">
                      {returnsList.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {invoice.invoiceNumber}
                  </span>
                </div>

                {returnsList.length ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full min-w-[510px] table-fixed text-left text-[11px]">
                      <colgroup>
                        <col className="w-[23%]" />
                        <col className="w-[22%]" />
                        <col className="w-[25%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                      </colgroup>
                      <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-2.5 py-2">Return No.</th>
                          <th className="px-2.5 py-2">Date</th>
                          <th className="px-2.5 py-2">Product</th>
                          <th className="px-2.5 py-2 text-center">Qty</th>
                          <th className="px-2.5 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {returnsList.map((ret) =>
                          (ret.returnedItems || []).map((item, index) => (
                            <tr
                              key={`${ret._id}-${item._id || index}`}
                              className="hover:bg-slate-50/70"
                            >
                              <td className="px-2.5 py-2 font-semibold text-slate-700">
                                {index === 0 ? ret.returnInvoiceNumber : ""}
                              </td>
                              <td className="px-2.5 py-2 text-slate-500">
                                {index === 0 ? formatDate(ret.returnDate) : ""}
                              </td>
                              <td className="px-2.5 py-2">
                                <p className="truncate font-medium text-slate-700">
                                  {item.product?.name || item.productName}
                                </p>
                                <p className="text-[9px] text-slate-400">
                                  {item.product?.sku || ""}
                                </p>
                              </td>
                              <td className="px-2.5 py-2 text-center font-semibold text-red-600">
                                {item.quantity}
                              </td>
                              <td className="px-2.5 py-2 text-right font-semibold tabular-nums text-slate-700">
                                {index === 0
                                  ? formatAmount(ret.returnAmount)
                                  : "-"}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center">
                    <p className="text-[10px] text-slate-400">
                      No returns recorded for this invoice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InvoiceReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleReturnSubmit}
        invoice={invoice}
        title={isPurchase ? "Create Purchase Return" : "Create Sale Return"}
        entityType={isPurchase ? "purchases" : "sales"}
      />
    </>
  );
}
