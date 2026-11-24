import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getSetting } from "../StoreAndHooks/slices/settingSlice";
import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const lastScrollY = useRef(0);
  const settingsRequested = useRef(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { settings, error: settingsError } = useSelector(
    (state) => state.businessSettings,
  );

  const business = settings?.businessDetails || {};

  const [profile] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");
      return savedUser?.profile || savedUser?.user || savedUser || {};
    } catch {
      return {};
    }
  });

  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (!settings && !settingsRequested.current) {
      settingsRequested.current = true;
      dispatch(getSetting());
    }
  }, [dispatch, settings]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHideHeader(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHideHeader(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !loggingOut) {
        setShowLogoutModal(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [loggingOut]);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      return nextTheme;
    });
  };

  const handleLogout = () => {
    setLoggingOut(true);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    setShowLogoutModal(false);
    setSidebarOpen(false);

    navigate("/login", { replace: true });
  };

  const handleRetrySettings = () => {
    settingsRequested.current = false;
    dispatch(getSetting());
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        business={business}
        profile={profile}
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      <div className="flex-1 flex flex-col lg:pl-56 min-w-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          profile={profile}
          hideHeader={hideHeader}
        />

        <main className="flex-1 p-4 sm:p-6">
          {!settings ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              {settingsError ? (
                <>
                  <p className="text-sm text-red-500">{settingsError}</p>

                  <button
                    onClick={handleRetrySettings}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <Loader2 size={28} className="animate-spin text-blue-600" />

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading system settings...
                  </p>
                </>
              )}
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
