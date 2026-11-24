import React, { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

const ErrorPopup = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.log("POPUP ERROR:", event.detail);
      setError(event.detail);
    };

    window.addEventListener("api-error", handleError);

    return () => {
      window.removeEventListener("api-error", handleError);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] w-[calc(100%-32px)] max-w-sm">
      <div className="bg-white rounded-2xl border border-red-100 shadow-2xl overflow-hidden">
        <div className="h-1 bg-red-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle size={23} className="text-red-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">
                  Something went wrong!
                </h3>

                <button
                  onClick={() => setError(null)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <X size={19} />
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-2 break-words">
                {error.message}
              </p>

              <div className="flex gap-2 mt-3"></div>
            </div>
          </div>

          <button
            onClick={() => setError(null)}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-sm font-semibold transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
