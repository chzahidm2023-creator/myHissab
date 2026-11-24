import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  totalItems = 0,
  startIndex = 0,
  currentItemsCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
}) {
  if (totalItems <= 0) return null;

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500 sm:flex-row sm:px-5 min-w-0">
      <div className="text-center sm:text-left whitespace-nowrap">
        Showing {startIndex + 1} to{" "}
        {Math.min(startIndex + currentItemsCount, totalItems)} of {totalItems}{" "}
        results
      </div>

      <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
        <button
          disabled={currentPage <= 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>

        {getPages().map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="px-1 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              disabled={loading || currentPage === page}
              onClick={() => onPageChange(page)}
              className={`min-w-8 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          disabled={currentPage >= totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
