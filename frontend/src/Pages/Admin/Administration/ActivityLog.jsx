import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Eye,
  X,
  Loader2,
  Clock,
  UserRound,
  FileText,
  Activity,
  Package,
  CalendarDays,
} from "lucide-react";
import { getActivityLogs } from "../../../StoreAndHooks/slices/acitvitySlice";
import { useDateFormat } from "../../../StoreAndHooks/hooks/useDateFormat";
import Pagination from "../../../components/Pagination";
const getUser = (item) =>
  item?.user || item?.performedBy || item?.createdBy || {};
const getUserName = (item) => {
  const user = getUser(item);
  return typeof user === "string"
    ? user
    : user?.name ||
        user?.fullName ||
        user?.username ||
        item?.userName ||
        "Unknown User";
};
const getUserEmail = (item) => {
  const user = getUser(item);
  return typeof user === "object" ? user?.email || "—" : "—";
};
const getAction = (item) =>
  item?.action || item?.activity || item?.event || "—";
const getModule = (item) =>
  item?.module || item?.resource || item?.entity || "—";
const getIP = (item) =>
  item?.ipAddress || item?.ip || item?.metadata?.ip || "—";
const getTime = (item) =>
  item?.createdAt || item?.timestamp || item?.date || item?.time;
const isMongoId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
const isDateField = (key) => /date|time|createdat|updatedat/i.test(key);

const getRecord = (item) => {
  const record = item?.recordDetails;
  return record && typeof record === "object"
    ? record.name ||
        record.productName ||
        record.invoiceNumber ||
        record.brandID ||
        record.sku ||
        "—"
    : "—";
};

const formatLabel = (value) =>
  String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function RecordValue({ value, formatDateTime }) {
  const [expanded, setExpanded] = useState(false);

  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "string" || typeof value === "number") {
    if (isMongoId(String(value)))
      return <span className="text-slate-400">—</span>;
    return (
      <span className="break-all text-xs font-medium text-slate-700">
        {String(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    const items = value.filter((item) => item && typeof item === "object");
    if (!items.length) return <span className="text-slate-400">Empty</span>;

    return (
      <div className="w-full space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Hide" : "View"} {items.length} items
        </button>
        {expanded && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            {items.map((item, index) => (
              <div
                key={item?._id || index}
                className="rounded-md border border-slate-100 bg-slate-50 p-3"
              >
                <p className="mb-2 text-[10px] font-bold text-slate-400">
                  Item {index + 1}
                </p>
                <RecordValue value={item} formatDateTime={formatDateTime} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([key, item]) =>
        !["_id", "__v"].includes(key) &&
        !(typeof item === "string" && isMongoId(item)),
    );
    if (!entries.length) return <span className="text-slate-400">—</span>;

    return (
      <div className="w-full space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
        {expanded && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            {entries.map(([key, item]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0 sm:grid-cols-[120px_1fr]"
              >
                <span className="text-[10px] font-medium text-slate-400">
                  {formatLabel(key)}
                </span>
                {isDateField(key) && item ? (
                  <span className="text-xs font-medium text-slate-700">
                    {formatDateTime(item)}
                  </span>
                ) : (
                  <RecordValue value={item} formatDateTime={formatDateTime} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-xs text-slate-700">{String(value)}</span>;
}

function ActivityDetailModal({ activity, onClose, formatDateTime }) {
  if (!activity) return null;

  const recordDetails = activity.recordDetails;
  const recordFields = recordDetails
    ? Object.entries(recordDetails).filter(
        ([key, value]) =>
          !["_id", "__v"].includes(key) &&
          !(typeof value === "string" && isMongoId(value)),
      )
    : [];

  const details = [
    { label: "Action", value: getAction(activity) },
    { label: "Module", value: getModule(activity) },
    { label: "Date & Time", value: formatDateTime(getTime(activity)) },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Activity Details
              </h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Complete activity and record information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div>
              <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                {getAction(activity)}
              </span>
              <h3 className="mt-2 text-sm font-bold capitalize text-slate-800">
                {getModule(activity)}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {activity.description || "No description available"}
              </p>
            </div>
            <div className="text-right">
              <Clock size={16} className="ml-auto text-blue-500" />
              <p className="mt-2 text-[10px] font-medium text-slate-600">
                {formatDateTime(getTime(activity))}
              </p>
            </div>
          </div>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-800">
              <UserRound size={15} className="text-blue-600" /> User Information
            </h3>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
              {[
                { label: "User Name", value: getUserName(activity) },
                { label: "Email", value: getUserEmail(activity) },
                { label: "IP Address", value: getIP(activity) },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                  <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-800">
              <FileText size={15} className="text-blue-600" /> Activity
              Information
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="grid grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid-cols-[140px_1fr]"
                >
                  <span className="text-[10px] text-slate-400">
                    {detail.label}
                  </span>
                  <span className="break-all text-xs font-medium text-slate-700 sm:text-right">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Package size={15} className="text-blue-600" /> Record Details
              </h3>
              {recordDetails && (
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  Record Found
                </span>
              )}
            </div>

            {recordFields.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {recordFields.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-2 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid-cols-[150px_1fr]"
                  >
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatLabel(key)}
                    </span>
                    <div className="min-w-0">
                      {isDateField(key) && value ? (
                        <span className="text-xs font-medium text-slate-700">
                          {formatDateTime(value)}
                        </span>
                      ) : (
                        <RecordValue
                          value={value}
                          formatDateTime={formatDateTime}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <Package size={23} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  No record details available
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  The record may have been deleted or its details are
                  unavailable.
                </p>
              </div>
            )}
          </section>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays size={13} />
              <span className="text-[10px]">Created At</span>
            </div>
            <p className="mt-2 text-[10px] font-medium text-slate-700">
              {formatDateTime(activity.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const dispatch = useDispatch();
  const formatDate = useDateFormat();

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return `${formatDate(value)} ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  const {
    logs = [],
    pagination = {},
    loading,
    error,
  } = useSelector((state) => state.activityLogs);
  const {
    defaultPeriod = "all",
    customStartDate = "",
    customEndDate = "",
    paginationLimit = 10,
  } = useSelector(
    (state) => state.businessSettings.settings?.systemPreferences || {},
  );

  const itemsPerPage = Math.max(
    1,
    Math.min(100, Number(paginationLimit) || 10),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    dispatch(
      getActivityLogs({
        page: currentPage,
        limit: itemsPerPage,
        search: appliedSearch,
      }),
    );
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    appliedSearch,
    defaultPeriod,
    customStartDate,
    customEndDate,
  ]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSelectedActivity(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const totalItems = Number(pagination.total ?? logs.length);
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages || Math.ceil(totalItems / itemsPerPage)),
  );
  const startIndex = totalItems ? (currentPage - 1) * itemsPerPage : 0;
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, i) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i,
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(searchTerm.trim());
  };

  const handleReset = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 font-sans text-slate-800 sm:p-5 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Activity Log
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track business activities, users and record details.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <Activity size={15} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {totalItems} Activities
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search user, action, module, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Search size={14} /> Search
              </button>
              {(searchTerm || appliedSearch) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={14} /> Reset
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {typeof error === "string" ? error : error.message}
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase text-slate-400">
                    <tr>
                      {[
                        "Time",
                        "User",
                        "Action",
                        "Module",
                        "Record",
                        "IP Address",
                        "Details",
                      ].map((label) => (
                        <th
                          key={label}
                          className={`whitespace-nowrap px-5 py-3.5 ${label === "Details" ? "text-center" : ""}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length ? (
                      logs.map((item, index) => (
                        <tr
                          key={item._id || item.id || index}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-500">
                            <span className="flex items-center gap-2">
                              <Clock size={13} className="text-slate-400" />
                              {formatDateTime(getTime(item))}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-800">
                            {getUserName(item)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                              {getAction(item)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium capitalize text-slate-500">
                            {getModule(item)}
                          </td>
                          <td className="max-w-[190px] truncate whitespace-nowrap px-5 py-3.5 font-medium text-slate-700">
                            {String(getRecord(item))}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-400">
                            {getIP(item)}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => setSelectedActivity(item)}
                              title="View activity details"
                              className="inline-flex items-center justify-center rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : !loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-16 text-center text-xs font-medium text-slate-400"
                        >
                          No activity logs found.
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-16 text-center">
                          <Loader2
                            size={22}
                            className="mx-auto animate-spin text-blue-600"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Loading activity logs...
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {totalItems > 0 && (
            <Pagination
              totalItems={totalItems}
              startIndex={startIndex}
              currentItemsCount={logs.length}
              currentPage={currentPage}
              totalPages={totalPages}
              pages={pages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
        </div>
      </div>

      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}
