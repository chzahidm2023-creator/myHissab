import { useNavigate } from "react-router-dom";
import { SearchX, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <SearchX className="w-10 h-10 text-blue-600" />
        </div>

        <p className="text-sm font-bold tracking-widest text-blue-600 mb-3">
          ERROR 404
        </p>

        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-500 leading-6 mb-8">
          The page you are looking for doesn't exist, may have been moved, or
          the URL is incorrect.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
