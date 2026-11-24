import { X } from "lucide-react";
import { useSelector } from "react-redux";
export default function ViewProductModal({ product, onClose, onEdit }) {
  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );
  const business = settings.businessDetails || {};
  const currency = business.currency || "PKR";

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* MODAL CONTAINER */}
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="bg-white sm-3 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Product Details
            </span>
            <h5 className="text-small sm:text-small font-bold text-slate-900 tracking-tight mt-1">
              {product.name || "Untitled Product"}
            </h5>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-lg font-bold"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY (SCROLLABLE AREA) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* IMAGE SECTION (4 COLUMNS ON DESKTOP) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center p-2 relative group">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || "Product"}
                    className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <svg
                      className="w-12 h-12 mb-2 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs font-medium text-slate-400">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS SECTION (7 COLUMNS ON DESKTOP) */}
            <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                    Product Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {product.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                    SKU / Code
                  </p>
                  <p className="text-xs font-bold text-slate-800 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">
                    {product.sku || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${
                      product.status === "Active" || !product.status
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {product.status || "Active"}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <p className="text-[11px] font-medium text-blue-600 mb-0.5">
                    Sale Price
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {currency} {parseFloat(product.salePrice || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500 mb-0.5">
                    Purchase Price
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {currency}{" "}
                    {parseFloat(product.purchasePrice || 0).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-medium text-slate-400 mb-1">
                    Stock Availability
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${
                      Number(product.stock) <= 0
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        Number(product.stock) <= 0
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {product.stock || 0} units available
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-medium text-slate-400 mb-1">
                    Description
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed max-h-24 overflow-y-auto">
                    {product.description ||
                      "No description available for this product."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2 sticky bottom-0 z-10 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Record
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 active:red-black rounded-lg transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
