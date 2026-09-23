import { useState } from "react";
import { Search, ArrowRight, X, BookOpen, FileText, Cpu, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import meridianLogo from "../assets/meridian-logo.png";

const SPOTLIGHT_ITEMS = [
  { id: "drift", title: "Autonomous Drift Detection", category: "Capabilities", desc: "Monitors allocation variance beyond ±5% thresholds continuously." },
  { id: "rebalance", title: "Automated Rebalancing Engine", category: "Engine", desc: "Generates optimal tax-aware rebalancing orders across custodians." },
  { id: "compliance", title: "SEC & Fiduciary Compliance Rules", category: "Compliance", desc: "Automated pre-trade rule validation and trade justification." },
  { id: "custodians", title: "Multi-Custodian Integration", category: "Infrastructure", desc: "Schwab, Fidelity, Vanguard live synchronization." },
  { id: "advisors", title: "Wealth Manager Portal", category: "Portal", desc: "Manage client rosters, audit trails, and portfolio approvals." },
];

const RESOURCE_ITEMS = [
  { icon: FileText, title: "Fiduciary AI Whitepaper", desc: "How agentic pipelines satisfy SEC Rule 204(4) standards." },
  { icon: Cpu, title: "Meridian 6-Agent Architecture", desc: "Technical breakdown of deterministic agent orchestration." },
  { icon: BookOpen, title: "Platform API & Webhook Docs", desc: "Integrate custodian feeds via REST and WebSocket APIs." },
];

export default function Navbar({ onSignIn, onScrollTo }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const filteredItems = SPOTLIGHT_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <nav className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-bg/80 backdrop-blur-xl border-b border-hairline">
        <div className="flex items-center cursor-pointer" onClick={() => onScrollTo?.("top")}>
          <img
            src={meridianLogo}
            alt="Meridian Wealth Console"
            className="h-11 md:h-12 w-auto object-contain mix-blend-multiply transition-transform hover:scale-[1.02]"
          />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <button onClick={() => onScrollTo?.("top")} className="text-ink border-b-2 border-gold pb-1 cursor-pointer">
            Home
          </button>
          <button onClick={() => onScrollTo?.("solutions")} className="text-muted hover:text-ink transition-colors cursor-pointer">
            Our Solutions
          </button>
          <button onClick={onSignIn} className="text-muted hover:text-ink transition-colors cursor-pointer">
            For Advisors
          </button>
          <button onClick={() => setResourcesOpen(true)} className="text-muted hover:text-ink transition-colors cursor-pointer">
            Resources
          </button>
          <button onClick={() => onScrollTo?.("purpose")} className="text-muted hover:text-ink transition-colors cursor-pointer">
            About
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search platform"
            className="text-muted hover:text-ink transition-colors p-2 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <Search size={17} strokeWidth={1.75} />
          </button>
          <button
            onClick={onSignIn}
            className="text-sm px-4 py-2 rounded-lg border border-hairline hover:border-gold/40 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onSignIn}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-ink text-bg hover:opacity-90 transition-opacity cursor-pointer font-medium"
          >
            Get Started <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* SPOTLIGHT SEARCH MODAL */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="bg-surface border border-hairline rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline">
                <Search size={18} className="text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search capabilities, agents, compliance rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="text-muted hover:text-ink p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 divide-y divide-hairline">
                {filteredItems.length === 0 ? (
                  <p className="text-xs text-muted py-8 text-center">No platform items match &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchOpen(false);
                        onSignIn?.();
                      }}
                      className="p-3 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">{item.title}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] text-muted">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-snug">{item.desc}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 bg-black/[0.02] border-t border-hairline flex items-center justify-between text-[11px] text-muted">
                <span>Press ESC or click outside to close</span>
                <span className="text-gold font-medium">Click any item to explore</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESOURCES MODAL */}
      <AnimatePresence>
        {resourcesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-hairline rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-base">Platform Resources</h3>
                    <p className="text-[11px] text-muted">Technical docs, whitepapers, and guides</p>
                  </div>
                </div>
                <button
                  onClick={() => setResourcesOpen(false)}
                  className="text-muted hover:text-ink p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {RESOURCE_ITEMS.map((res, i) => {
                  const Icon = res.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setResourcesOpen(false);
                        onSignIn?.();
                      }}
                      className="p-3.5 rounded-xl border border-hairline hover:border-gold/40 hover:bg-black/[0.02] transition-all cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-ink group-hover:text-gold transition-colors">{res.title}</p>
                          <ExternalLink size={12} className="text-muted group-hover:text-gold" />
                        </div>
                        <p className="text-[11px] text-muted mt-0.5 leading-snug">{res.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-hairline text-xs">
                <span className="text-muted flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal" /> Verified SEC Compliant
                </span>
                <button
                  onClick={() => { setResourcesOpen(false); onSignIn?.(); }}
                  className="px-3 py-1.5 rounded-lg bg-gold text-bg font-medium text-xs hover:bg-gold/90 transition-colors cursor-pointer"
                >
                  Access Portal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}