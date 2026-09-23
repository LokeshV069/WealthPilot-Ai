import { useState } from "react";
import { motion } from "framer-motion";
import { Mountain, User, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onBack }) {
  const { login, error } = useAuth();
  const [mode, setMode] = useState("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    login(mode, email, password);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg px-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-sm">
        {onBack && (
          <button onClick={onBack} className="text-xs text-muted hover:text-ink transition-colors mb-4">
            ← Back
          </button>
        )}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center mb-3">
            <Mountain size={22} className="text-gold" strokeWidth={2} />
          </div>
          <p className="font-display text-xl">Meridian</p>
          <p className="text-xs text-muted mt-0.5">Wealth Console</p>
        </div>

        <div className="flex mb-6 border border-hairline rounded-lg p-1">
          {[
            { key: "manager", label: "Manager", icon: Briefcase },
            { key: "client", label: "Client", icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setMode(key); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-md transition-colors ${
                mode === key ? "bg-white/[0.06] text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === "manager" ? "manager@meridian.com" : "ananya@meridian.com"}
              className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-hairline rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
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
              className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-hairline rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
              required
            />
          </div>
          {error && <p className="text-xs text-rust">{error}</p>}
          <button type="submit" className="w-full py-2 rounded-lg bg-gold/90 hover:bg-gold text-bg text-sm font-medium transition-colors mt-2">
            Sign In
          </button>
        </form>

        <p className="text-[11px] text-muted mt-6 text-center leading-relaxed">
          Demo — Manager: manager@meridian.com / admin123<br />
          Client: ananya@meridian.com / client123
        </p>
      </motion.div>
    </div>
  );
}