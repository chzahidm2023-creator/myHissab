import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StockAdjustmentModal from "../Forms/StockAdjustment";
import ViewStockMovementModal from "../viewModals/StockMovementViewModal";
import Pagination from "../../../components/Pagination";
import {
  getProducts,
  getAllStockHistory,
  updateStockAdjustment,
} from "../../../StoreAndHooks/slices/productSlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";

const getFilters = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    productPage: Math.max(1, Number(params.get("productsPage")) || 1),
    movementPage: Math.max(1, Number(params.get("movementsPage")) || 1),
    search: params.get("search") || "",
    lowStock: params.get("lowStock") === "true",
  };
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function StockOverview() {
  const dispatch = useDispatch();
  const formatDate = useDateFormat();

  const {
    products = [],
    loading,
    actionLoading,
    error,
    stockHistory = [],
    stockHistoryPagination = {},
    stockHistoryLoading,
  } = useSelector((state) => state.product || {});

  const preferences = useSelector(
    (state) => state.businessSettings?.settings?.systemPreferences || {},
  );

  const settings = useSelector(
    (state) => state.businessSettings?.settings || {},
  );

  const business = settings.businessDetails || {};
  const currency = business.currency || "PKR";
  const limit = Number(preferences.paginationLimit) || 10;
  const defaultPeriod = preferences.defaultPeriod || "all";
  const customStartDate = preferences.customStartDate || "";
  const customEndDate = preferences.customEndDate || "";

  const [filters] = useState(getFilters);
  const [page, setPage] = useState(filters.productPage);
  const [movementPage, setMovementPage] = useState(filters.movementPage);
  const [search, setSearch] = useState(filters.search);
  const [lowStock, setLowStock] = useState(filters.lowStock);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const loadProducts = () =>
    dispatch(
      getProducts({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    );

  const loadMovements = () =>
    dispatch(
      getAllStockHistory({
        page: movementPage,
        limit,
        search: search.trim(),
      }),
    );

  useEffect(() => {
    loadProducts();
  }, [dispatch, defaultPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    loadMovements();
  }, [dispatch, movementPage, search, limit]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("productsPage", page);
    params.set("movementsPage", movementPage);

    search.trim()
      ? params.set("search", search.trim())
      : params.delete("search");

    lowStock ? params.set("lowStock", "true") : params.delete("lowStock");

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`,
    );
  }, [page, movementPage, search, lowStock]);

  const allStockList = products.map((product) => ({
    ...product,
    stock: Number(product.openingStock) || 0,
    minimum: Number(product.minimumStock) || 0,
  }));

  const inventoryValue = allStockList.reduce(
    (total, product) =>
      total + (Number(product.purchasePrice) || 0) * product.stock,
    0,
  );

  const filteredProducts = allStockList.filter((product) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      product.name?.toLowerCase().includes(searchValue) ||
      product.sku?.toLowerCase().includes(searchValue) ||
      product.barcode?.toLowerCase().includes(searchValue);

    const matchesStock = !lowStock || product.stock <= product.minimum;

    return matchesSearch && matchesStock;
  });

  const totalProducts = filteredProducts.length;
  const productPages = Math.max(1, Math.ceil(totalProducts / limit));

  const currentProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit,
  );

  const productStartIndex = totalProducts ? (page - 1) * limit + 1 : 0;

  const movementTotal = Number(stockHistoryPagination.totalHistory) || 0;

  const movementLimit = Number(stockHistoryPagination.limit) || limit;

  const movementPages = Math.max(
    1,
    Number(stockHistoryPagination.totalPages) ||
      Math.ceil(movementTotal / movementLimit),
  );

  const movementStartIndex = movementTotal
    ? (movementPage - 1) * movementLimit + 1
    : 0;

  useEffect(() => {
    if (page > productPages) setPage(productPages);
  }, [page, productPages]);

  useEffect(() => {
    if (movementPage > movementPages) {
      setMovementPage(movementPages);
    }
  }, [movementPage, movementPages]);

  const movements = stockHistory.map((item) => ({
    id: item._id,
    date: item.date,
    product: item.productName || "—",
    productId: item.productId,
    type: item.adjustmentType,
    change: Number(item.change) || 0,
    quantity: Number(item.quantity) || 0,
    balanceAfter: item.totoalAfter ?? "—",
    reason: item.reason || "—",
  }));

  const handleAdjustStock = async (formData) => {
    try {
      const type = String(formData.adjustmentType || "").toLowerCase();

      const adjustmentType = [
        "substraction",
        "subtraction",
        "decrease",
      ].includes(type)
        ? "decrease"
        : "increase";

      const id = formData.productId || formData.product;

      if (!id || !formData.quantity) return;

      await dispatch(
        updateStockAdjustment({
          id,
          adjustmentType,
          quantity: Number(formData.quantity),
          reason: formData.reason || "",
        }),
      ).unwrap();

      await Promise.all([loadProducts(), loadMovements()]);
      setShowAdjust(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Stock overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inventory value:{" "}
              <span className="font-semibold text-slate-800">
                {currency} {formatCurrency(inventoryValue)}
              </span>
            </p>
          </div>

          <button
            onClick={() => setShowAdjust(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            + Adjust stock
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  setMovementPage(1);
                }}
                placeholder="Search products"
                className="w-full sm:w-64 text-xs px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-600"
              />

              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => {
                    setLowStock(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-blue-600"
                />
                Low stock only
              </label>

              <button
                onClick={() => {
                  setSearch("");
                  setLowStock(false);
                  setPage(1);
                  setMovementPage(1);
                }}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Clear filters
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {totalProducts} products
            </span>
          </div>

          <div className="relative overflow-x-auto">
            {loading && products.length > 0 && (
              <div className="absolute top-2 right-3 z-10 pointer-events-none">
                <span className="block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase">
                <tr>
                  {[
                    "Product",
                    "SKU",
                    "Current stock",
                    "Minimum",
                    "Stock value",
                    "Status",
                  ].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Loading products...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((row) => {
                    const status =
                      row.stock <= 0
                        ? "Out of stock"
                        : row.stock <= row.minimum
                          ? "Low stock"
                          : "In stock";

                    return (
                      <tr key={row._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {row.sku || "—"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {row.stock}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {row.minimum}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {currency}{" "}
                          {formatCurrency(
                            (Number(row.purchasePrice) || 0) * row.stock,
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              status === "In stock"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "Low stock"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              totalItems={totalProducts}
              startIndex={productStartIndex}
              currentItemsCount={currentProducts.length}
              currentPage={page}
              totalPages={productPages}
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Stock movements
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete stock adjustment history of all products
            </p>
          </div>

          <div className="relative overflow-x-auto">
            {stockHistoryLoading && movements.length > 0 && (
              <div className="absolute top-2 right-3 z-10 pointer-events-none">
                <span className="block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase">
                <tr>
                  {[
                    "Date",
                    "Product",
                    "Type",
                    "Change",
                    "Balance after",
                    "Reason",
                  ].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 && stockHistoryLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Loading stock history...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No stock history found
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr
                      key={movement.id}
                      onClick={() => setSelectedMovement(movement)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {formatDate(movement.date)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {movement.product}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {movement.type}
                      </td>
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                        <span
                          className={
                            movement.change < 0
                              ? "text-red-500"
                              : "text-emerald-600"
                          }
                        >
                          {movement.change > 0 ? "+" : ""}
                          {movement.change}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {movement.balanceAfter}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {movement.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              totalItems={movementTotal}
              startIndex={movementStartIndex}
              currentItemsCount={movements.length}
              currentPage={movementPage}
              totalPages={movementPages}
              onPageChange={setMovementPage}
              loading={stockHistoryLoading}
            />
          </div>
        </div>
      </div>

      <StockAdjustmentModal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        onSubmit={handleAdjustStock}
        productsList={allStockList}
        title="Adjust stock"
        description="Record a manual stock adjustment or inventory update."
        submitText={actionLoading ? "Saving..." : "Save adjustment"}
      />

      <ViewStockMovementModal
        movement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}
