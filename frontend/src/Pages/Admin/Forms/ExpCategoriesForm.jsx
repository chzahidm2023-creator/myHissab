import React, { useState, useEffect } from "react";

export default function ExpenseCategoryModal({
  isOpen,
  onClose,
  onSave,
  categoryData,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (categoryData) {
      setName(categoryData.name || "");
      setDescription(categoryData.description || "");
      setActive(categoryData.active !== undefined ? categoryData.active : true);
    } else {
      setName("");
      setDescription("");
      setActive(true);
    }
  }, [categoryData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: categoryData ? categoryData.id : null,
      name,
      description,
      active,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {categoryData
                ? "Update expense category"
                : "Add expense category"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your category records organized and up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold"
          ></button>
        </div>

        {/* BODY FORM */}
        <div className="overflow-y-auto p-6 flex-1 text-xs">
          <form
            id="category-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Utilities, Salaries..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Enter category description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-3 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activeStatus"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="activeStatus"
                className="text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Mark as Active
              </label>
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="grid md:grid-cols-4 sm:grid-cols-4 grid-cols-2 text-sm bg-white px-2 py-2 border-t border-slate-200 ">
          <div className="p-1 ">
            <button
              type="submit"
              form="reusable-entity-form"
              className="px-1 py-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {categoryData ? "Update category" : "Save category"}
            </button>
          </div>
          <div className="p-1 ">
            <button
              type="button "
              onClick={onClose}
              className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
