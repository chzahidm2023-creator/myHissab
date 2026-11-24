import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Users,
  ShoppingCart,
  LogOut,
  X,
  FileText,
  Truck,
  Award,
  Boxes,
  LayersPlus,
  CornerDownLeft,
  CircleDollarSign,
  HandCoins,
  CreditCard,
  ChartNoAxesColumn,
  Group,
  RollerCoaster,
  Settings,
  Logs,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Power,
} from "lucide-react";

const menuGroups = [
  {
    title: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Overview", path: "/" },
      { icon: FileText, label: "Sales & invoices", path: "/sales-invoices" },
      { icon: ShoppingBag, label: "Purchases", path: "/purchases" },
      { icon: Users, label: "Customers", path: "/customers" },
      { icon: Truck, label: "Suppliers", path: "/suppliers" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { icon: ShoppingCart, label: "Products", path: "/products" },
      { icon: Grid, label: "Categories", path: "/categories" },
      { icon: Award, label: "Brands", path: "/brands" },
      { icon: Boxes, label: "Units", path: "/units" },
      { icon: LayersPlus, label: "Stock Overview", path: "/stocks" },
    ],
  },
  {
    title: "Accounting",
    items: [
      { icon: CornerDownLeft, label: "Sales Return", path: "/sale-return" },
      {
        icon: CornerDownLeft,
        label: "Purchase Return",
        path: "/purchase-return",
      },
      { icon: CircleDollarSign, label: "Expense", path: "/expense" },
      {
        icon: HandCoins,
        label: "Expense Categories",
        path: "/exense-categories",
      },
      { icon: CreditCard, label: "Payments", path: "/payments" },
      { icon: ChartNoAxesColumn, label: "Reports", path: "/reports" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: Group, label: "Team & Permissions", path: "/team-permissions" },
      { icon: RollerCoaster, label: "Roles", path: "/team-roles" },
      { icon: Settings, label: "Settings", path: "/setting" },
      { icon: Logs, label: "Activity Log", path: "/activity-log" },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
  business = {},
  profile = {},
  showLogoutModal,
  setShowLogoutModal,
  onLogout,
  loggingOut = false,
}) {
  const closeSidebar = () => {
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#0a1128] text-white flex flex-col border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-800/40">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              {business.logo && (
                <img
                  src={business.logo}
                  alt="Business logo"
                  className="max-h-10 max-w-10 object-contain"
                />
              )}
            </div>
            <span className="font-bold tracking-tight text-white text-lg truncate">
              {business.businessName || "HisabPro"}
            </span>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeSidebar}
                      style={{
                        textDecoration: "none",
                        borderBottom: "none",
                        boxShadow: "none",
                        outline: "none",
                      }}
                      className={({ isActive }) =>
                        `group flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 !no-underline ${
                          isActive
                            ? "!bg-blue-600 !text-white shadow-lg shadow-blue-600/30"
                            : "!text-slate-200 hover:!text-white hover:!bg-slate-800/40"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={20}
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-white"
                                : "text-slate-400 group-hover:text-white"
                            }`}
                          />
                          <span
                            style={{ textDecoration: "none" }}
                            className="truncate no-underline"
                          >
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800/40">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 border border-slate-700/50 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 group transition-all"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-red-500/15">
              <LogOut size={16} />
            </span>
            <span>Sign out</span>
            <ArrowRight
              size={14}
              className="ml-auto opacity-50 group-hover:opacity-100"
            />
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/70 overflow-hidden">
            <div className="relative px-6 pt-6 pb-5 text-center">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={17} />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-100 dark:border-red-500/20">
                <LogOut size={25} className="text-red-500" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Sign out?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Are you sure you want to sign out of your HisabPro account? You
                will need to login again to continue.
              </p>
            </div>

            <div className="px-6 pb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {profile?.name || "Current User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {profile?.email || "HisabPro Account"}
                  </p>
                </div>

                <ShieldCheck size={17} className="text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-70"
                >
                  {loggingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <Power size={16} />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-slate-400" />
              <span className="text-[11px] text-slate-400">
                Your session will be securely closed
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
