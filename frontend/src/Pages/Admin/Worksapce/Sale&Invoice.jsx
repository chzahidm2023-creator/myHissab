import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Loader2, View } from "lucide-react";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import InvoiceForm from "../Forms/InvoiceForm";
import ViewInvoiceModal from "../viewModals/InvoiceModal";
import { getProducts } from "../../../StoreAndHooks/slices/productSlice";
import { getCustomerList } from "../../../StoreAndHooks/slices/customerSlice";
import {
  getAllSaleInvoices,
  createSaleInvoice,
  getSaleInvoiceById,
  clearSelectedInvoice,
} from "../../../StoreAndHooks/slices/saleInvoiceSlice";
import Pagination from "../../../components/Pagination";
const initialForm = {
  party: "",
  date: new Date().toISOString().split("T")[0],
  items: [],
  notes: "",
  discountAmount: 0,
  taxAmount: 0,
  paymentMethod: "Cash",
  paidAmount: 0,
};

export default function SaleInvoices() {
  const dispatch = useDispatch();
  const formatDate = useDateFormat();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const {
    selectedInvoice,
    detailsLoading,
    invoices = [],
    loading,
    totalPages = 1,
    totalInvoices = 0,
    actionLoading,
  } = useSelector((state) => state.saleInvoice || {});

  const products = useSelector((state) => state.product?.products || []);
  const customers = useSelector((state) => state.customers?.customers || []);
  const preferences = useSelector(
    (state) => state.businessSettings?.settings?.systemPreferences || {},
  );

  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [refresh, setRefresh] = useState(0);

  const { items, discountAmount, taxAmount, paidAmount } = formData;

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const grandTotal = Math.max(
    0,
    subtotal - Number(discountAmount || 0) + Number(taxAmount || 0),
  );
  const remainingBalance = Math.max(0, grandTotal - Number(paidAmount || 0));

  useEffect(() => {
    dispatch(getCustomerList({ limit: "all", status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        dispatch(
          getAllSaleInvoices({
            page,
            search: search.trim(),
            sortBy: "createdAt",
            sortOrder: "desc",
            period: preferences.defaultPeriod || "all",
            ...(preferences.defaultPeriod === "custom" && {
              startDate: String(preferences.customStartDate || "").slice(0, 10),
              endDate: String(preferences.customEndDate || "").slice(0, 10),
            }),
          }),
        ),
      300,
    );

    return () => clearTimeout(timer);
  }, [
    dispatch,
    page,
    search,
    preferences.defaultPeriod,
    preferences.customStartDate,
    preferences.customEndDate,
    refresh,
  ]);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        dispatch(
          getProducts({
            search: searchQuery.trim(),
            page: 1,
            limit: 10,
            status: "active",
          }),
        ),
      300,
    );

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  const updateParams = (key, value) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, String(value));
        return next;
      },
      { replace: true },
    );
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (product) => {
    const id = product.productId || product.id;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.some((item) => item.productId === id)
        ? prev.items.map((item) =>
            item.productId === id
              ? { ...item, quantity: Number(item.quantity) + 1 }
              : item,
          )
        : [...prev.items, { ...product, productId: id, quantity: 1 }],
    }));

    setSearchQuery("");
  };

  const handleQtyChange = (id, quantity) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === id
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item,
      ),
    }));
  };

  const handleRemoveItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== id),
    }));
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setSearchQuery("");
    setIsOpen(true);
  };
  const handleSubmit = async () => {
    await dispatch(
      createSaleInvoice({
        customer: formData.party,
        invoiceDate: formData.date,
        items: items.map((item) => ({
          product: item.productId,
          productName: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price) * Number(item.quantity),
        })),
        subtotal,
        discountAmount: Number(discountAmount || 0),
        taxAmount: Number(taxAmount || 0),
        grandTotal,
        paidAmount: Number(paidAmount || 0),
        remainingAmount: remainingBalance,
        notes: formData.notes,
      }),
    ).unwrap();

    if (page !== 1) updateParams("page", 1);
    else setRefresh((prev) => prev + 1);
  };
  const handleViewInvoice = async (id) => {
    dispatch(clearSelectedInvoice());
    setShowViewModal(true);
    try {
      await dispatch(getSaleInvoiceById(id)).unwrap();
    } catch (error) {
      console.log("Invoice Fetch Failed:", error);
      setShowViewModal(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    dispatch(clearSelectedInvoice());
  };

  const sampleProducts = products.map((p) => ({
    id: p._id,
    productId: p._id,
    name: p.name,
    sku: p.sku || "",
    price: Number(p.salePrice ?? p.sellingPrice ?? p.price ?? 0),
  }));
  const startIndex = totalInvoices
    ? (page - 1) * Number(preferences.paginationLimit || 10) + 1
    : 0;
  const endIndex = Math.min(
    (page - 1) * Number(preferences.paginationLimit || 10) + invoices.length,
    totalInvoices,
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] p-4 font-sans text-slate-800 sm:p-6">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sales &amp; invoices
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage customer invoices and sales transactions.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New sale
          </button>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setParams(
                    { search: e.target.value, page: "1" },
                    { replace: true },
                  );
                }}
                placeholder="Search invoice or customer..."
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              Total invoices:{" "}
              <span className="font-semibold text-slate-700">
                {totalInvoices}
              </span>
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="relative">
              <table className="w-full table-auto text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-400">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Invoice</th>
                    <th className="whitespace-nowrap px-4 py-3">Date</th>
                    <th className="whitespace-nowrap px-4 py-3">Customer</th>
                    <th className="whitespace-nowrap px-4 py-3">Total</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 && loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          Loading sale invoices...
                        </div>
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No sale invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const status =
                        inv.paymentStatus === "paid"
                          ? "Paid"
                          : inv.paymentStatus === "partial"
                            ? "Partial"
                            : "Unpaid";

                      return (
                        <tr
                          key={inv._id}
                          className="transition-colors duration-150 hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-600">
                            {inv.invoiceNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {formatDate(inv.invoiceDate || inv.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                            {inv.customer?.name || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                            {Number(inv.grandTotal || 0).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${
                                status === "Paid"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                  : status === "Partial"
                                    ? "border-amber-200 bg-amber-50 text-amber-600"
                                    : "border-rose-200 bg-rose-50 text-rose-600"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <button
                              onClick={() => handleViewInvoice(inv._id)}
                              className="inline-flex items-center font-semibold text-blue-600 transition-colors hover:text-blue-800"
                            >
                              <View />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {loading && invoices.length > 0 && (
                <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-blue-600 shadow-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating
                </div>
              )}
            </div>
          </div>
          <Pagination
            totalItems={totalInvoices}
            startIndex={startIndex}
            currentItemsCount={endIndex - startIndex + 1}
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={(newPage) => updateParams("page", newPage)}
            loading={loading}
          />
        </div>
      </div>

      <InvoiceForm
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setFormData(initialForm);
          setSearchQuery("");
        }}
        onSubmit={handleSubmit}
        title="Create a sale"
        subtitle="Add products and post your invoice."
        submitButtonText={actionLoading ? "Saving..." : "Post sale"}
        partyTypeLabel="Customer"
        partyOptions={customers}
        formData={formData}
        onFieldChange={handleFieldChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sampleProducts={sampleProducts}
        onAddItem={handleAddItem}
        onQtyChange={handleQtyChange}
        onRemoveItem={handleRemoveItem}
        subtotal={subtotal}
        grandTotal={grandTotal}
        remainingBalance={remainingBalance}
      />

      {showViewModal && (
        <ViewInvoiceModal
          isOpen={showViewModal}
          invoice={selectedInvoice}
          loading={detailsLoading}
          onClose={closeViewModal}
          title="Sales invoice"
        />
      )}
    </div>
  );
}
