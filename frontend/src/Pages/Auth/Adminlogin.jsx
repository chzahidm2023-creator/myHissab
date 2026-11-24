import React, { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearAuthError } from "../../StoreAndHooks/AuthSlice";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const result = await dispatch(
      loginUser({
        identifier: email,
        password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d132b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <header className="w-full px-6 lg:px-16 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md relative z-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-all duration-300">
            <span className="text-white font-bold text-xl tracking-wider">
              S
            </span>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            ShopEase{" "}
            <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-1 font-semibold tracking-wider">
              Admin Portal
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Authentication
          </span>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide shadow-inner animate-bounce duration-1000">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorized Management Access 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
            Command Center for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              Amazing Products
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Manage inventory, review analytics, process orders securely, and
            oversee the entire ShopEase ecosystem with advanced administrative
            controls.
          </p>

          <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              System Status: Optimal
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Secure Authentication
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-blue-500/40">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-blue-500/20 via-transparent to-transparent pointer-events-none"></div>

            {success ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Access Granted!
                </h3>
                <p className="text-sm text-slate-400">
                  Redirecting to ShopEase Admin Dashboard...
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Admin Sign In
                  </h2>
                  <p className="text-sm text-slate-400">
                    Enter your credentials to access the console
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Username / Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter username or email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-white/20 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer accent-blue-600"
                    />
                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors text-xs">
                      Remember this device
                    </span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 overflow-hidden disabled:opacity-70 disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Admin Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Protected by ShopEase Enterprise Security &copy; 2026
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-white/5 relative z-10">
        <p>
          ShopEase Admin Portal • Confidential Area • All Unauthorized Access
          Attempts Are Logged
        </p>
      </footer>
    </div>
  );
}
