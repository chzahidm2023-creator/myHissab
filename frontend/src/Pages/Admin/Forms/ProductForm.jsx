import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Package,
  ImagePlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Boxes,
  Info,
} from "lucide-react";
import { getCategoryList } from "../../../StoreAndHooks/slices/categorySlice";
import { getBrandList } from "../../../StoreAndHooks/slices/brandSlice";
import { getUnitList } from "../../../StoreAndHooks/slices/unitSlice";

const initialFormData = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  brand: "",
  unit: "",
  purchasePrice: "0",
  salePrice: "0",
  openingStock: "0",
  minimumStock: "0",
  image: null,
  imageName: "",
  existingImage: "",
  description: "",
  isActive: true,
};

const inputClass =
  "w-full h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100";

const labelClass = "mb-1 block text-[10px] font-semibold text-slate-600";

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  children,
  step,
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {children || (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          className={inputClass}
        />
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
          <Icon size={14} />
        </span>
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
        {children}
      </div>
    </section>
  );
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = "Add product",
  description = "Manage your product information.",
  submitText = "Save product",
}) {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.categories || {});
  const { brands = [] } = useSelector((state) => state.brands || {});
  const { units = [] } = useSelector((state) => state.units || {});

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    dispatch(getCategoryList({ limit: "all", status: "active" }));
    dispatch(getBrandList({ limit: "all", status: "active" }));
    dispatch(getUnitList({ limit: "all", status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    setFeedback(null);
    setSubmitting(false);
    setFormData(
      initialData
        ? {
            ...initialFormData,
            ...initialData,
            category: initialData.category?._id || initialData.category || "",
            brand: initialData.brand?._id || initialData.brand || "",
            unit: initialData.unit?._id || initialData.unit || "",
            image: null,
            imageName: "",
            existingImage: initialData.image || "",
          }
        : initialFormData,
    );
    setPreview(initialData?.image || "");
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!formData.image) return;
    const url = URL.createObjectURL(formData.image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.image]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file)
      setFormData((prev) => ({ ...prev, image: file, imageName: file.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setFeedback(null);

    const data = new FormData();
    const fields = [
      "name",
      "sku",
      "barcode",
      "category",
      "brand",
      "unit",
      "purchasePrice",
      "salePrice",
      "description",
      "isActive",
    ];

    fields.forEach((key) => data.append(key, String(formData[key] ?? "")));
    data.append("openingStock", String(Number(formData.openingStock) || 0));
    data.append("minimumStock", String(Number(formData.minimumStock) || 0));

    if (formData.image) data.append("product-image", formData.image);

    setSubmitting(true);

    try {
      await onSubmit(data);
      setFeedback({
        type: "success",
        message: initialData
          ? "Product updated successfully!"
          : "Product created successfully!",
      });
      setTimeout(onClose, 2000);
    } catch (error) {
      const status = Number(
        error?.status || error?.response?.status || error?.data?.status,
      );

      const message =
        status === 401
          ? "Your session has expired. Please login again."
          : status === 403
            ? "You are not authorized to perform this action."
            : error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.data?.message ||
              error?.message ||
              "Something went wrong. Please try again.";

      setFeedback({ type: "error", message });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const selectField = (label, name, items, placeholder) => (
    <Field label={label} name={name}>
      <select
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        disabled={submitting}
        className={inputClass}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
    </Field>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-2xl sm:max-h-[92dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Package size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {title}
              </h3>
              <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-400 transition hover:text-red-600 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          {feedback && (
            <div
              role="alert"
              className={`absolute left-1/2 top-16  w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
                feedback.type === "success"
                  ? "border-emerald-200 text-emerald-600"
                  : "border-red-200 text-red-600"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={19} className="shrink-0" />
              ) : (
                <AlertCircle size={19} className="shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">
                  {feedback.type === "success" ? "Success" : "Error"}
                </p>
                <p className="mt-0.5 text-[11px]">{feedback.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="rounded-md p-1 transition hover:bg-slate-100"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <form
            id="product-form-modal"
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <Section icon={Package} title="Product information">
              <Field
                label="Product name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                disabled={submitting}
              />
              <Field
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. PRD-0001"
                disabled={submitting}
              />
              <Field
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Enter barcode"
                disabled={submitting}
              />
              {selectField(
                "Category",
                "category",
                categories,
                "Select category",
              )}
              {selectField("Brand", "brand", brands, "Select brand")}
              {selectField("Unit", "unit", units, "Select unit")}
            </Section>

            <Section icon={Tag} title="Pricing details">
              <Field
                label="Purchase price"
                name="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
                disabled={submitting}
              />
              <Field
                label="Sale price"
                name="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00"
                disabled={submitting}
              />
            </Section>

            <Section icon={Boxes} title="Stock & inventory">
              <Field
                label="Opening stock"
                name="openingStock"
                type="number"
                value={formData.openingStock}
                onChange={handleChange}
                placeholder="0"
                disabled={submitting}
              />
              <Field
                label="Minimum stock"
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                placeholder="0"
                disabled={submitting}
              />
            </Section>

            <Section icon={ImagePlus} title="Additional details">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product image</label>
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {formData.imageName ||
                        (preview
                          ? "Current product image"
                          : "No image selected")}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Select an image for your product
                    </p>
                  </div>
                  <label
                    className={`cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 ${
                      submitting ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Browse image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={submitting}
                      className="hidden"
                    />
                  </label>
                  {preview && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          image: null,
                          imageName: "",
                          existingImage: "",
                        }));
                        setPreview("");
                      }}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <Field label="Description" name="description">
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Write product description..."
                    className={`${inputClass} h-auto min-h-[65px] resize-none py-2`}
                  />
                </Field>
              </div>
            </Section>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                  <Info size={14} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Product status
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {formData.isActive
                      ? "Product is available"
                      : "Product is inactive"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative h-5 w-10 rounded-full transition ${
                  formData.isActive ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    formData.isActive ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </form>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white p-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form-modal"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Saving..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
