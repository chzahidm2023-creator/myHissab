import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  ReceiptText,
  SlidersHorizontal,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Globe,
  Coins,
  FileText,
  Percent,
  CalendarDays,
  ListFilter,
  Image,
  X,
  Sparkles,
} from "lucide-react";
import {
  getSetting,
  updateBusinessSettings,
  clearSettingsError,
  clearSettingsSuccess,
} from "../../../StoreAndHooks/slices/settingSlice";

const dateFormatOptions = [
  { label: "DD/MM/YYYY (20/10/2026)", value: "DD/MM/YYYY" },
  { label: "MM/DD/YYYY (10/20/2026)", value: "MM/DD/YYYY" },
  { label: "YYYY-MM-DD (2026-10-20)", value: "YYYY-MM-DD" },
  { label: "DD-MM-YYYY (20-10-2026)", value: "DD-MM-YYYY" },
];

const defaultPeriodOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last-7-days" },
  { label: "Last 15 Days", value: "last-15-days" },
  { label: "Last 30 Days", value: "last-30-days" },
  { label: "Last 60 Days", value: "last-60-days" },
  { label: "Last 90 Days", value: "last-90-days" },
  { label: "Last 6 Months", value: "last-6-months" },
  { label: "Last Year", value: "last-1-year" },
  { label: "Customized", value: "custom" },
  { label: "All", value: "all" },
];

const initialForm = {
  businessName: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  currency: "PKR",
  invoicePrefix: "INV-",
  invoiceFooter: "Thank you for your business.",
  tax: "0",
  dateFormat: "MM/DD/YYYY",
  defaultPeriod: "all",
  customStartDate: "",
  customEndDate: "",
  paginationLimit: "10",
};

const inputClass =
  "w-full h-10 text-xs border border-slate-200 rounded-xl px-3.5 text-slate-700 bg-slate-50/50 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";

const labelClass = "block text-xs font-semibold text-slate-600 mb-2";

const tabs = [
  {
    id: "business",
    label: "Business Details",
    description: "Company information",
    icon: Building2,
  },
  {
    id: "invoice",
    label: "Invoice Preferences",
    description: "Invoice customization",
    icon: ReceiptText,
  },
  {
    id: "system",
    label: "System Preferences",
    description: "Application settings",
    icon: SlidersHorizontal,
  },
];

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function BusinessSettings() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const { settings, loading, actionLoading, error, success } = useSelector(
    (state) => state.businessSettings,
  );

  const [formData, setFormData] = useState(initialForm);
  const [logo, setLogo] = useState(null);
  const [logoFileName, setLogoFileName] = useState("No file chosen");
  const [activeTab, setActiveTab] = useState("business");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;

    setFormData({
      businessName: settings.businessDetails?.businessName || "",
      phone: settings.businessDetails?.phone || "",
      email: settings.businessDetails?.email || "",
      address: settings.businessDetails?.address || "",
      website: settings.businessDetails?.website || "",
      currency: settings.businessDetails?.currency || "PKR",
      invoicePrefix: settings.invoicePreferences?.invoicePrefix || "INV-",
      invoiceFooter: settings.invoicePreferences?.invoiceFooter || "",
      tax: String(settings.invoicePreferences?.tax ?? 0),
      dateFormat: settings.systemPreferences?.dateFormat || "MM/DD/YYYY",
      defaultPeriod: settings.systemPreferences?.defaultPeriod || "all",
      customStartDate: formatDateInput(
        settings.systemPreferences?.customStartDate,
      ),
      customEndDate: formatDateInput(settings.systemPreferences?.customEndDate),
      paginationLimit: String(
        settings.systemPreferences?.paginationLimit ?? 10,
      ),
    });
  }, [settings]);

  useEffect(() => {
    if (!success) return;

    setSuccessMessage("Your business settings have been updated successfully.");

    const timer = setTimeout(() => {
      setSuccessMessage("");
      dispatch(clearSettingsSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setLogo(file);
      setLogoFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!settings?._id) return;

    if (formData.defaultPeriod === "custom") {
      if (!formData.customStartDate || !formData.customEndDate) {
        setActiveTab("system");
        setSuccessMessage("");
        dispatch(clearSettingsError());
        return;
      }

      if (formData.customStartDate > formData.customEndDate) {
        setActiveTab("system");
        return;
      }
    }

    dispatch(clearSettingsError());
    dispatch(clearSettingsSuccess());
    setSuccessMessage("");

    const data = new FormData();

    data.append(
      "businessDetails",
      JSON.stringify({
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        currency: formData.currency,
      }),
    );

    data.append(
      "invoicePreferences",
      JSON.stringify({
        invoicePrefix: formData.invoicePrefix,
        invoiceFooter: formData.invoiceFooter,
        tax: Number(formData.tax),
      }),
    );

    data.append(
      "systemPreferences",
      JSON.stringify({
        dateFormat: formData.dateFormat,
        defaultPeriod: formData.defaultPeriod,
        customStartDate:
          formData.defaultPeriod === "custom" ? formData.customStartDate : null,
        customEndDate:
          formData.defaultPeriod === "custom" ? formData.customEndDate : null,
        paginationLimit: Number(formData.paginationLimit),
      }),
    );

    if (logo) data.append("logo", logo);

    try {
      await dispatch(
        updateBusinessSettings({
          id: settings._id,
          formData: data,
        }),
      ).unwrap();

      setLogo(null);
      setLogoFileName("No file chosen");

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      console.error("Business Settings Error:", error);
    }
  };

  const field = (label, name, Icon, placeholder, type = "text", extra = {}) => (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <div className="relative group">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition"
          />
        )}
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
          required={name === "businessName"}
          min={type === "number" ? 0 : undefined}
          {...extra}
        />
      </div>
    </div>
  );

  const selectField = (label, name, Icon, options) => (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <div className="relative group">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 pointer-events-none"
        />
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`${inputClass} pl-10 pr-8 cursor-pointer appearance-none`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <SlidersHorizontal
          size={13}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );

  const sectionHeading = (title, description) => (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      <p className="text-[11px] text-slate-400 mt-1">{description}</p>
    </div>
  );

  const logoUrl = settings?.businessDetails?.logo || "";

  if (loading && !settings) {
    return (
      <div className="min-h-72 flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
        <Loader2 size={25} className="animate-spin text-blue-600" />
        Loading business settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5 md:p-6 text-slate-800">
      {successMessage && (
        <div className="fixed top-5 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[370px]">
          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-xl shadow-slate-200/70 animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="flex items-start gap-3.5 p-4">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800">
                  Successfully Saved!
                </h3>
                <p className="text-[11px] leading-5 text-slate-500 mt-1">
                  {successMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  dispatch(clearSettingsSuccess());
                }}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X size={17} />
              </button>
            </div>
            <div className="h-1 w-full bg-green-50">
              <div
                className="h-full bg-green-500"
                style={{
                  animation: "settingsToastProgress 3s linear forwards",
                }}
              />
            </div>
          </div>
          <style>{`
            @keyframes settingsToastProgress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <SlidersHorizontal size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Business Settings
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage your business configuration and preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-fit">
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[11px] font-semibold text-slate-600">
              General Configuration
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={19} className="text-red-600 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(clearSettingsError())}
              className="ml-auto text-red-400 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        active
                          ? "bg-blue-50 border border-blue-100"
                          : "border border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold ${
                            active ? "text-blue-700" : "text-slate-700"
                          }`}
                        >
                          {tab.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {tab.description}
                        </p>
                      </div>
                      {active && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-6 min-h-[390px]">
              {activeTab === "business" && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 size={19} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Business Information
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Update your company identity and contact details.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                    {field(
                      "Business Name",
                      "businessName",
                      Store,
                      "Enter business name",
                    )}
                    {field(
                      "Phone Number",
                      "phone",
                      Phone,
                      "Enter phone number",
                      "tel",
                    )}
                    {field(
                      "Email Address",
                      "email",
                      Mail,
                      "Enter email address",
                      "email",
                    )}
                    {field(
                      "Business Address",
                      "address",
                      MapPin,
                      "Enter business address",
                    )}
                    {field(
                      "Website",
                      "website",
                      Globe,
                      "https://example.com",
                      "url",
                    )}
                    {field("Currency", "currency", Coins, "e.g. PKR")}
                  </div>

                  <div className="mt-7 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Image size={16} className="text-blue-600" />
                      <h3 className="text-xs font-bold text-slate-700">
                        Business Branding
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
                      <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {logo ? (
                          <img
                            src={URL.createObjectURL(logo)}
                            alt="Selected logo"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Business logo"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Building2 size={26} className="text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700">
                          Business Logo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          {logoFileName === "No file chosen"
                            ? "Upload your company logo (PNG, JPG or WEBP)"
                            : logoFileName}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition"
                          >
                            <Upload size={13} />
                            Choose Logo
                          </button>
                          {logo && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogo(null);
                                setLogoFileName("No file chosen");
                                if (fileRef.current) {
                                  fileRef.current.value = "";
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-100 transition"
                            >
                              <X size={13} />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "invoice" && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ReceiptText size={19} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Invoice Configuration
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Customize invoice numbering, tax and footer details.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                    {field(
                      "Invoice Prefix",
                      "invoicePrefix",
                      FileText,
                      "e.g. INV-",
                    )}
                    {field(
                      "Tax Percentage",
                      "tax",
                      Percent,
                      "Enter tax percentage",
                      "number",
                      { step: "0.01", max: 100 },
                    )}
                  </div>

                  <div className="mt-5">
                    <label className={labelClass}>Invoice Footer Message</label>
                    <div className="relative group">
                      <FileText
                        size={15}
                        className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500"
                      />
                      <textarea
                        name="invoiceFooter"
                        value={formData.invoiceFooter}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter invoice footer message..."
                        className="w-full resize-none text-xs border border-slate-200 rounded-xl py-3 px-3.5 pl-10 text-slate-700 bg-slate-50/50 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      This message will appear at the bottom of your invoices.
                    </p>
                  </div>

                  <div className="mt-6 rounded-xl bg-blue-50/70 border border-blue-100 p-4">
                    <p className="text-[11px] font-bold text-blue-800 mb-1">
                      Invoice Preview
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {formData.invoicePrefix || "INV-"}0001
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Invoice numbering format
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-700">
                          {formData.tax || 0}%
                        </p>
                        <p className="text-[10px] text-slate-500">Tax rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "system" && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <SlidersHorizontal size={19} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        System Configuration
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Configure date formats and application listing behavior.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                    {selectField(
                      "Date Format",
                      "dateFormat",
                      CalendarDays,
                      dateFormatOptions,
                    )}
                    {selectField(
                      "Default Period",
                      "defaultPeriod",
                      ListFilter,
                      defaultPeriodOptions,
                    )}
                    {field(
                      "Pagination Limit",
                      "paginationLimit",
                      SlidersHorizontal,
                      "e.g. 10",
                      "number",
                      { min: 1, max: 100 },
                    )}
                  </div>

                  {formData.defaultPeriod === "custom" && (
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={16} className="text-blue-600" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-800">
                            Customized Date Range
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Select the date range to apply across your records.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={labelClass}>From Date</label>
                          <input
                            type="date"
                            name="customStartDate"
                            value={formData.customStartDate}
                            max={formData.customEndDate || undefined}
                            onChange={handleChange}
                            required
                            className={inputClass}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className={labelClass}>To Date</label>
                          <input
                            type="date"
                            name="customEndDate"
                            value={formData.customEndDate}
                            min={formData.customStartDate || undefined}
                            onChange={handleChange}
                            required
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <SlidersHorizontal size={15} className="text-blue-600" />
                      <p className="text-xs font-bold text-slate-700">
                        Current Configuration
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      <div className="bg-white rounded-lg border border-slate-100 p-3">
                        <p className="text-[10px] text-slate-400">
                          Date Format
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                          {formData.dateFormat}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-100 p-3">
                        <p className="text-[10px] text-slate-400">
                          Default Period
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                          {defaultPeriodOptions.find(
                            (option) => option.value === formData.defaultPeriod,
                          )?.label || "All"}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-100 p-3 col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-slate-400">
                          Records Per Page
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                          {formData.paginationLimit}
                        </p>
                      </div>
                    </div>

                    {formData.defaultPeriod === "custom" && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-white rounded-lg border border-slate-100 p-3">
                          <p className="text-[10px] text-slate-400">
                            From Date
                          </p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {formData.customStartDate || "Not selected"}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-100 p-3">
                          <p className="text-[10px] text-slate-400">To Date</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {formData.customEndDate || "Not selected"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100">
              <p className="text-[10px] text-slate-400">
                Changes will be applied to your business settings.
              </p>

              <button
                type="submit"
                disabled={actionLoading || !settings?._id}
                className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold shadow-sm shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {actionLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
