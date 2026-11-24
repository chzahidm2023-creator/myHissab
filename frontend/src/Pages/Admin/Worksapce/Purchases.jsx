import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Loader2, View } from "lucide-react";
import InvoiceForm from "../Forms/InvoiceForm";
import ViewInvoiceModal from "../viewModals/InvoiceModal";
import {
  getAllPurchaseInvoices,
  createPurchaseInvoice,
  getPurchaseInvoiceById,
  clearCurrentPurchaseInvoice,
} from "../../../StoreAndHooks/slices/purchaseInvSlice";
import { getProducts } from "../../../StoreAndHooks/slices/productSlice";
import { getSupplierList } from "../../../StoreAndHooks/slices/supplierSlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import Pagination from "../../../components/Pagination";

const emptyForm = {
  party: "",
  date: new Date().toISOString().split("T")[0],
  items: [],
  notes: "",
  discountAmount: 0,
  taxAmount: 0,
  paymentMethod: "Cash",
  paidAmount: 0,
};

export default function PurchaseInvoices() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const formatDate = useDateFormat();

  const search = params.get("search") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { settings } = useSelector((state) => state.businessSettings || {});
  const preferences = settings?.systemPreferences || {};
  const limit = Number(preferences.paginationLimit) || 10;
  const period = preferences.defaultPeriod || "all";

  const {
    invoices = [],
    loading,
    detailsLoading,
    totalPages = 1,
    totalInvoices = 0,
    currentInvoice: selectedInvoice,
  } = useSelector((state) => state.purchaseInvoice);

  const suppliers = useSelector((state) => state.suppliers?.suppliers || []);
  const products = useSelector((state) => state.product?.products || []);

  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const updateParams = (values) => {
    setParams((prev) => {
      Object.entries(values).forEach(([key, value]) =>
        prev.set(key, String(value)),
      );
      return prev;
    });
  };

  useEffect(() => {
    if (params.get("limit") !== String(limit)) {
      updateParams({ limit });
    }
  }, [limit]);

  useEffect(() => {
    dispatch(getSupplierList({ limit: "all", status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAllPurchaseInvoices({
          search: search.trim(),
          page,
          limit,
          period,
          ...(period === "custom" && {
            startDate: preferences.customStartDate?.slice(0, 10),
            endDate: preferences.customEndDate?.slice(0, 10),
          }),
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    search,
    page,
    limit,
    period,
    preferences.customStartDate,
    preferences.customEndDate,
    refresh,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getProducts({
          search: searchQuery.trim(),
          page: 1,
          limit: 10,
          status: "active",
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  const handleView = async (id) => {
    dispatch(clearCurrentPurchaseInvoice());
    setShowViewModal(true);

    try {
      await dispatch(getPurchaseInvoiceById(id)).unwrap();
    } catch {
      setShowViewModal(false);
    }
  };

  const handleAddItem = (product) => {
    const id = product._id || product.id;

    setFormData((prev) => {
      const exists = prev.items.some(
        (item) => (item.product || item.id) === id,
      );

      return {
        ...prev,
        items: exists
          ? prev.items.map((item) =>
              (item.product || item.id) === id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [
              ...prev.items,
              {
                ...product,
                id,
                product: id,
                name: product.name,
                price: Number(product.price || product.salePrice || 0),
                quantity: 1,
              },
            ],
      };
    });

    setSearchQuery("");
  };

  const handleQtyChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        (item.product || item.id) === id
          ? { ...item, quantity: Math.max(1, Number(value) || 1) }
          : item,
      ),
    }));
  };
  const handleRemoveItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => (item.product || item.id) !== id),
    }));
  };
  const subtotal = formData.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const grandTotal = Math.max(
    0,
    subtotal -
      Number(formData.discountAmount || 0) +
      Number(formData.taxAmount || 0),
  );

  const handleSubmit = async () => {
    const payload = {
      supplier: formData.party,
      invoiceDate: formData.date,
      items: formData.items.map((item) => ({
        product: item.product || item.id,
        productName: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.price) * Number(item.quantity),
      })),
      subtotal,
      discountAmount: Number(formData.discountAmount) || 0,
      taxAmount: Number(formData.taxAmount) || 0,
      grandTotal,
      paidAmount: Number(formData.paidAmount) || 0,
      notes: formData.notes,
    };

    await dispatch(createPurchaseInvoice(payload)).unwrap();

    setFormData(emptyForm);
    setSearchQuery("");
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-800 sm:p-6">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Purchases &amp; bills
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Posted supplier bills and purchase transactions.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData(emptyForm);
              setSearchQuery("");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New purchase
          </button>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-3 sm:p-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) =>
                  updateParams({ search: e.target.value, page: 1 })
                }
                placeholder="Search invoice or supplier..."
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="relative">
              <table className="w-full table-auto text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-400">
                  <tr>
                    {[
                      "Invoice",
                      "Date",
                      "Supplier",
                      "Total",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`whitespace-nowrap px-4 py-3 ${
                          ["Total", "Action", "Status"].includes(h)
                            ? "text-center"
                            : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 && loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="h-[360px] text-center text-slate-400"
                      >
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-blue-600" />
                        Loading purchase invoices...
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="h-[360px] text-center text-slate-400"
                      >
                        No purchase invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-600">
                          {inv.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {formatDate(inv.invoiceDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                          {inv.supplier?.name || ""}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-800">
                          {Number(inv.grandTotal || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                            {inv.paymentStatus === "paid"
                              ? "Paid"
                              : inv.paymentStatus === "partial"
                                ? "Partial"
                                : "Unpaid"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <button
                            onClick={() => handleView(inv._id)}
                            className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <View size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {loading && invoices.length > 0 && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          </div>

          <Pagination
            totalItems={totalInvoices}
            startIndex={totalInvoices ? (page - 1) * limit + 1 : 0}
            currentItemsCount={Math.min(
              limit,
              Math.max(0, totalInvoices - (page - 1) * limit),
            )}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => updateParams({ page: newPage })}
            loading={loading}
          />
        </div>
      </div>

      <InvoiceForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        title="Create a purchase"
        subtitle="Add products, confirm payment, and post your purchase bill."
        submitButtonText="Post purchase"
        partyTypeLabel="Supplier"
        partyOptions={suppliers}
        formData={formData}
        onFieldChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sampleProducts={products}
        onAddItem={handleAddItem}
        onQtyChange={handleQtyChange}
        onRemoveItem={handleRemoveItem}
        subtotal={subtotal}
      />

      {showViewModal &&
        (detailsLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-lg bg-white px-6 py-4 text-xs font-semibold text-slate-700 shadow-xl">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Loading purchase invoice...
            </div>
          </div>
        ) : selectedInvoice ? (
          <ViewInvoiceModal
            invoice={selectedInvoice}
            title="Purchase invoice"
            onClose={() => {
              setShowViewModal(false);
              dispatch(clearCurrentPurchaseInvoice());
            }}
          />
        ) : null)}
    </div>
  );
}
