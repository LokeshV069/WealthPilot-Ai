import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, User, Briefcase, Loader2, UserPlus, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onBack }) {
  const { login, register, error, setError } = useAuth();
  const [authType, setAuthType] = useState("login"); // 'login' | 'register'
  const [mode, setMode] = useState("manager"); // 'manager' | 'client'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (authType === "login") {
        await login(mode, email, password);
      } else {
        await register({
          name,
          email,
          password,
          role: mode,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(userType) {
    setError("");
    if (userType === "manager") {
      setMode("manager");
      setEmail("manager@meridian.com");
      setPassword("admin123");
    } else {
      setMode("client");
      setEmail("ananya@meridian.com");
      setPassword("client123");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-teal/5 blur-3xl pointer-events-none -bottom-32 -right-32" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {onBack && (
          <button onClick={onBack} className="text-xs text-muted hover:text-ink transition-colors mb-4 cursor-pointer">
            ← Back to Home
          </button>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center mb-3 border border-gold/30 shadow-sm">
            <Mountain size={24} className="text-gold" strokeWidth={2} />
          </div>
          <p className="font-display text-2xl tracking-tight">Meridian</p>
          <p className="text-xs text-muted mt-0.5">Autonomous Wealth Management Console</p>
        </div>

        {/* TAB: Sign In vs Create Account */}
        <div className="flex mb-4 bg-black/[0.03] border border-hairline rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setAuthType("login");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all cursor-pointer ${
              authType === "login"
                ? "bg-surface text-ink shadow-sm border border-hairline"
                : "text-muted hover:text-ink"
            }`}
          >
            <LogIn size={13} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthType("register");
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all cursor-pointer ${
              authType === "register"
                ? "bg-surface text-ink shadow-sm border border-hairline"
                : "text-muted hover:text-ink"
            }`}
          >
            <UserPlus size={13} />
            Create Account
          </button>
        </div>

        {/* ROLE SELECTOR: Manager vs Client */}
        <div className="flex mb-4 border border-hairline rounded-xl p-1 bg-black/[0.02]">
          {[
            { key: "manager", label: "Manager / Advisor", icon: Briefcase },
            { key: "client", label: "Client / Investor", icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-all cursor-pointer ${
                mode === key
                  ? "bg-gold/15 text-ink font-medium border border-gold/30 shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={13} strokeWidth={1.75} className={mode === key ? "text-gold" : "text-muted"} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait">
            {authType === "register" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-xs text-muted mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={mode === "manager" ? "e.g. Lokesh V" : "e.g. Rahul Sharma"}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface border border-hairline rounded-xl placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-ink"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-xs text-muted mb-1 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === "manager" ? "manager@meridian.com" : "ananya@meridian.com"}
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-hairline rounded-xl placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-ink"
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-surface border border-hairline rounded-xl placeholder:text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-ink"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rust bg-rust/10 border border-rust/20 rounded-lg p-2 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-bg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : authType === "login" ? (
              `Sign In as ${mode === "manager" ? "Advisor" : "Client"}`
            ) : (
              `Create ${mode === "manager" ? "Manager" : "Client"} Account`
            )}
          </button>
        </form>

        {/* 1-Click Demo Buttons */}
        {authType === "login" && (
          <div className="mt-6 pt-5 border-t border-hairline">
            <p className="text-[11px] text-muted mb-2 text-center flex items-center justify-center gap-1">
              <Sparkles size={11} className="text-gold" /> Quick Demo Credentials:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo("manager")}
                className="flex-1 py-1.5 px-2 text-[11px] rounded-lg border border-hairline hover:border-gold/40 hover:bg-gold/5 text-muted hover:text-ink transition-all cursor-pointer text-center"
              >
                Advisor (Lokesh)
              </button>
              <button
                type="button"
                onClick={() => fillDemo("client")}
                className="flex-1 py-1.5 px-2 text-[11px] rounded-lg border border-hairline hover:border-teal/40 hover:bg-teal/5 text-muted hover:text-ink transition-all cursor-pointer text-center"
              >
                Client (Ananya)
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}