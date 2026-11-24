import { useState } from "react";
import {
  Menu,
  Bell,
  Moon,
  Sun,
  User,
  Mail,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export default function Navbar({
  onMenuClick,
  theme,
  onThemeToggle,
  profile = {},
  hideHeader = false,
}) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-transform duration-300 ${
        hideHeader ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <button
          onClick={onThemeToggle}
          className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div
          className="relative pl-3 border-l border-slate-200 dark:border-slate-800"
          onMouseEnter={() => setShowProfile(true)}
          onMouseLeave={() => setShowProfile(false)}
        >
          <button
            onClick={() => setShowProfile((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </button>

          <div
            className="relative pl-3 border-l border-slate-200 dark:border-slate-800"
            onMouseEnter={() => setShowProfile(true)}
            onMouseLeave={() => setShowProfile(false)}
          >
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {profile?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {profile?.role?.name ||
                        profile?.role ||
                        profile?.userType ||
                        "Admin"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                  <p className="text-xs text-slate-400 mb-1">Email Address</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 break-all">
                    {profile?.email || "Not available"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
