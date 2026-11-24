import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  NotebookPen,
  View,
  Trash,
} from "lucide-react";
import { getCategoryList } from "../../../StoreAndHooks/slices/categorySlice";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../StoreAndHooks/slices/productSlice";
import ProductFormModal from "../Forms/ProductForm";
import ViewProductModal from "../viewModals/ProductView";
import DeleteModal from "../viewModals/DeleteModal";
import Pagination from "../../../components/Pagination";

const getInitialFilters = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") || "",
    status: params.get("isActive") || "true",
    category: params.get("category") || "",
    lowStock: params.get("stockFilter") === "low-stock",
    page: Math.max(1, Number(params.get("page")) || 1),
  };
};

const isValidDate = (value) => {
  if (!value || !String(value).trim()) return false;
  return !Number.isNaN(new Date(value).getTime());
};

export default function Products() {
  const dispatch = useDispatch();

  const {
    products = [],
    loading,
    currentPage = 1,
    currentLimit = 10,
    totalPages = 1,
    totalProducts = 0,
  } = useSelector((state) => state.product);

  const { categories = [] } = useSelector((state) => state.categories || {});
  const { settings } = useSelector((state) => state.businessSettings || {});

  const preferences = settings?.systemPreferences || {};
  const defaultPeriod = preferences.defaultPeriod || "all";
  const customStartDate = preferences.customStartDate;
  const customEndDate = preferences.customEndDate;

  const [initial] = useState(getInitialFilters);
  const [search, setSearch] = useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [category, setCategory] = useState(initial.category);
  const [lowStock, setLowStock] = useState(initial.lowStock);
  const [page, setPage] = useState(initial.page);
  const [refresh, setRefresh] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteProductItem, setDeleteProductItem] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    dispatch(getCategoryList({}));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const filters = {
      page,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    if (defaultPeriod === "custom") {
      const validDates =
        isValidDate(customStartDate) &&
        isValidDate(customEndDate) &&
        new Date(customStartDate) <= new Date(customEndDate);

      if (validDates) {
        filters.period = "custom";
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      } else {
        filters.period = "all";
      }
    }

    if (debouncedSearch) filters.search = debouncedSearch;
    if (status !== "all") filters.isActive = status === "true";
    if (category) filters.category = category;
    if (lowStock) filters.stockFilter = "low-stock";

    const params = new URLSearchParams({
      page: String(page),
      isActive: status,
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (lowStock) params.set("stockFilter", "low-stock");

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );

    dispatch(getProducts(filters));
  }, [
    dispatch,
    page,
    defaultPeriod,
    customStartDate,
    customEndDate,
    debouncedSearch,
    status,
    category,
    lowStock,
    refresh,
  ]);

  const refreshList = () => setRefresh((prev) => prev + 1);

  const handleAdd = async (data) => {
    await dispatch(createProduct(data)).unwrap();
    setPage(1);
    refreshList();
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditOpen(true);
    setViewProduct(null);
  };

  const handleUpdate = async (data) => {
    if (!editProduct?._id) {
      throw new Error("Product information not found.");
    }

    await dispatch(
      updateProduct({
        id: editProduct._id,
        formData: data,
      }),
    ).unwrap();

    refreshList();
  };

  const handleDelete = async () => {
    if (!deleteProductItem) return;

    try {
      setDeleteError("");

      await dispatch(deleteProduct(deleteProductItem._id)).unwrap();

      setDeleteProductItem(null);

      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        refreshList();
      }
    } catch (error) {
      setDeleteError(
        typeof error === "string"
          ? error
          : error?.message || "Unable to delete product.",
      );
    }
  };

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const startIndex = totalProducts ? (currentPage - 1) * currentLimit + 1 : 0;

  const endIndex = Math.min(currentPage * currentLimit, totalProducts);

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Products
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business records in one place.
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span>
            Add product
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <input
                type="text"
                placeholder="Search name, SKU or barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-64 text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />

              <select
                value={status}
                onChange={(e) => changeFilter(setStatus, e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="all">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <select
                value={category}
                onChange={(e) => changeFilter(setCategory, e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => changeFilter(setLowStock, e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                Low stock
              </label>
            </div>

            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {totalProducts} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              {loading && (
                <div className="absolute top-0 left-0 right-0 z-10 h-0.5 overflow-hidden bg-blue-100">
                  <div className="h-full w-1/3 bg-blue-500 animate-[loading_1s_ease-in-out_infinite]" />
                </div>
              )}

              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/70 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Name</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">SKU</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">
                      Sale Price
                    </th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Stock</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.length ? (
                    products.map((prod) => (
                      <tr
                        key={prod._id}
                        className="hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                          {prod.name}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] whitespace-nowrap">
                          {prod.sku || "-"}
                        </td>

                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                          {Number(prod.salePrice || 0).toFixed(2)}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${
                              Number(prod.openingStock) <=
                              Number(prod.minimumStock)
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {prod.openingStock ?? 0}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${
                              prod.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {prod.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewProduct(prod)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              onClick={() => openEdit(prod)}
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <NotebookPen size={17} />
                            </button>

                            <button
                              onClick={() => {
                                setDeleteError("");
                                setDeleteProductItem(prod);
                              }}
                              className="p-2 bg-slate-50 hover:bg-blue-50 text-red-600 rounded-md border border-slate-200 transition-colors"
                            >
                              <Trash size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-slate-400"
                      >
                        {loading ? "Loading products..." : "No products found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            totalItems={totalProducts}
            startIndex={startIndex}
            currentItemsCount={endIndex - startIndex + 1}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>

      <ProductFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        initialData={null}
        title="Add Product"
        description="Fill in the details to register a new product."
        submitText="Save product"
      />

      <ProductFormModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditProduct(null);
        }}
        onSubmit={handleUpdate}
        initialData={editProduct}
        title="Update Product"
        description="Update existing product record details."
        submitText="Save Changes"
      />

      <ViewProductModal
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        onEdit={openEdit}
      />

      <DeleteModal
        isOpen={Boolean(deleteProductItem)}
        onClose={() => {
          setDeleteProductItem(null);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        itemName={deleteProductItem?.name}
        description={
          deleteError ||
          "Are you sure you want to delete this product? All associated inventory records will be permanently removed."
        }
      />
    </div>
  );
}
