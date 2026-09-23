import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Layers3, Building2, Plus, Download, Trash2, X, AlertCircle } from "lucide-react";
import ClientKpiCard from "../components/ClientKpiCard";
import AnimatedNumber from "../components/AnimatedNumber";
import { ASSET_META } from "../utils/assetMeta";
import { useToast } from "../context/ToastContext";

const CUSTODIAN_COLORS = ["var(--color-gold)", "var(--color-teal)", "var(--color-slate)", "var(--color-plum)"];
const ASSET_CLASSES = ["equity", "bonds", "cash", "alternatives"];
const KNOWN_CUSTODIANS = ["Charles Schwab", "Fidelity", "Vanguard", "Pershing", "Morgan Stanley"];

export default function Portfolio({ holdings = [], onAddHolding, onDeleteHolding }) {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({
    ticker: "",
    custodian: "Charles Schwab",
    quantity: "",
    price: "",
    assetClass: "equity",
  });
  const [formError, setFormError] = useState("");

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity || 0) * (h.price || 0), 0);
  const uniqueCustodians = [...new Set(holdings.map((h) => h.custodian).filter(Boolean))];
  const uniqueAssetClasses = [...new Set(holdings.map((h) => h.assetClass).filter(Boolean))];

  const largestHolding = holdings.length > 0
    ? holdings.reduce((a, b) => ((a.quantity || 0) * (a.price || 0) > (b.quantity || 0) * (b.price || 0) ? a : b))
    : null;
  const largestValue = largestHolding ? (largestHolding.quantity || 0) * (largestHolding.price || 0) : 0;

  const custodianTotals = uniqueCustodians.map((custodian, i) => {
    const value = holdings.filter((h) => h.custodian === custodian).reduce((s, h) => s + (h.quantity || 0) * (h.price || 0), 0);
    return { name: custodian, value, color: CUSTODIAN_COLORS[i % CUSTODIAN_COLORS.length] };
  });

  function handleExportCSV() {
    if (holdings.length === 0) {
      showToast("No holdings to export.", "info");
      return;
    }
    const headers = ["Ticker", "Custodian", "Asset Class", "Quantity", "Price ($)", "Total Value ($)", "Weight (%)"];
    const rows = holdings.map((h) => {
      const val = (h.quantity || 0) * (h.price || 0);
      const wt = totalValue > 0 ? ((val / totalValue) * 100).toFixed(2) : "0.00";
      return [h.ticker, h.custodian, h.assetClass, h.quantity, (h.price || 0).toFixed(2), val.toFixed(2), `${wt}%`];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meridian_holdings_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Portfolio holdings exported as CSV.", "success");
  }

  function handleSaveHolding(e) {
    e.preventDefault();
    if (!newHolding.ticker.trim()) {
      setFormError("Ticker symbol is required.");
      return;
    }
    const qty = parseFloat(newHolding.quantity);
    const prc = parseFloat(newHolding.price);
    if (isNaN(qty) || qty <= 0) {
      setFormError("Please enter a valid positive quantity.");
      return;
    }
    if (isNaN(prc) || prc <= 0) {
      setFormError("Please enter a valid positive price per unit.");
      return;
    }

    const payload = {
      ticker: newHolding.ticker.trim().toUpperCase(),
      custodian: newHolding.custodian,
      quantity: qty,
      price: prc,
      assetClass: newHolding.assetClass,
    };

    onAddHolding?.(payload);
    showToast(`Added ${payload.ticker} (${payload.quantity} shares @ $${payload.price}) to portfolio.`, "success");
    setNewHolding({
      ticker: "",
      custodian: "Charles Schwab",
      quantity: "",
      price: "",
      assetClass: "equity",
    });
    setFormError("");
    setShowAddModal(false);
  }

  function handleDelete(ticker) {
    onDeleteHolding?.(ticker);
    showToast(`Removed position ${ticker}.`, "info");
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* HEADER WITH VALUE AND ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted mb-1">Total Holdings Value</p>
          <p className="font-mono text-4xl text-ink">
            <AnimatedNumber value={totalValue} decimals={2} />
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-muted border border-hairline rounded-lg px-3.5 py-2 hover:border-gold/40 hover:text-ink transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium bg-gold hover:bg-gold/90 text-bg rounded-lg px-3.5 py-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Holding</span>
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ClientKpiCard
          icon={Layers3}
          iconColor="var(--color-gold)"
          label="Holdings"
          value={holdings.length}
          sub={`Across ${uniqueAssetClasses.length || 0} asset classes`}
          delay={0}
        />
        <ClientKpiCard
          icon={Building2}
          iconColor="var(--color-teal)"
          label="Custodians"
          value={uniqueCustodians.length}
          sub={uniqueCustodians.length > 0 ? uniqueCustodians.join(", ") : "None assigned"}
          delay={0.05}
        />
        <ClientKpiCard
          icon={largestHolding ? ASSET_META[largestHolding.assetClass]?.icon || Layers3 : Layers3}
          iconColor="var(--color-slate)"
          label="Largest Position"
          value={largestHolding ? largestHolding.ticker : "—"}
          sub={largestHolding ? `$${largestValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} value` : "No holdings recorded"}
          delay={0.1}
        />
      </div>

      {/* DETAIL AND BREAKDOWN GRID */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display text-lg">Holdings Detail</p>
              <p className="text-xs text-muted">Individual securities and allocation weight</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs text-gold hover:underline cursor-pointer"
            >
              <Plus size={12} /> Add Position
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="py-12 text-center">
              <Layers3 size={28} className="mx-auto text-muted/40 mb-2" />
              <p className="text-sm font-medium text-ink">No holdings in portfolio</p>
              <p className="text-xs text-muted mt-1">Click &ldquo;Add Holding&rdquo; to record security positions.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-gold text-bg font-medium cursor-pointer"
              >
                <Plus size={12} /> Add First Position
              </button>
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {holdings.map((h, i) => {
                const meta = ASSET_META[h.assetClass] || ASSET_META.equity;
                const Icon = meta.icon;
                const value = (h.quantity || 0) * (h.price || 0);
                const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
                return (
                  <motion.div
                    key={h.ticker + i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                    className="py-4 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}18` }}
                      >
                        <Icon size={14} style={{ color: meta.color }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{h.ticker}</p>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/[0.04] text-muted">
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{h.custodian}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted">
                          {h.quantity} @ ${(h.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(h.ticker)}
                        title="Remove position"
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-rust transition-all p-1.5 ml-1 rounded hover:bg-rust/10 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="h-1 bg-hairline rounded-full overflow-hidden ml-11">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: meta.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${weight}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* CUSTODIAN BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-premium p-6"
        >
          <p className="font-display text-lg mb-1">By Custodian</p>
          <p className="text-xs text-muted mb-4">Where holdings are held</p>

          {custodianTotals.length === 0 ? (
            <p className="text-xs text-muted py-8 text-center">No custodian data available.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={custodianTotals} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={3} stroke="none">
                      {custodianTotals.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {custodianTotals.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-mono text-muted">
                      {totalValue > 0 ? ((c.value / totalValue) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ADD HOLDING MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-hairline rounded-2xl p-6 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-base">Add Portfolio Position</h3>
                    <p className="text-[11px] text-muted">Record a newly acquired security holding</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setFormError(""); }}
                  className="text-muted hover:text-ink transition-colors p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-rust/10 border border-rust/20 flex items-center gap-2 text-rust text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveHolding} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1">Ticker Symbol</label>
                    <input
                      type="text"
                      placeholder="e.g. NVDA"
                      value={newHolding.ticker}
                      onChange={(e) => setNewHolding((h) => ({ ...h, ticker: e.target.value.toUpperCase() }))}
                      className="w-full bg-white/5 border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold/50"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Asset Class</label>
                    <select
                      value={newHolding.assetClass}
                      onChange={(e) => setNewHolding((h) => ({ ...h, assetClass: e.target.value }))}
                      className="w-full bg-white/5 border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold/50 capitalize cursor-pointer"
                    >
                      {ASSET_CLASSES.map((cls) => (
                        <option key={cls} value={cls} className="bg-surface text-ink capitalize">
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1">Custodian / Depository</label>
                  <select
                    value={newHolding.custodian}
                    onChange={(e) => setNewHolding((h) => ({ ...h, custodian: e.target.value }))}
                    className="w-full bg-white/5 border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold/50 cursor-pointer"
                  >
                    {KNOWN_CUSTODIANS.map((cust) => (
                      <option key={cust} value={cust} className="bg-surface text-ink">
                        {cust}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1">Quantity (Units)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 50"
                      value={newHolding.quantity}
                      onChange={(e) => setNewHolding((h) => ({ ...h, quantity: e.target.value }))}
                      className="w-full bg-white/5 border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 145.20"
                      value={newHolding.price}
                      onChange={(e) => setNewHolding((h) => ({ ...h, price: e.target.value }))}
                      className="w-full bg-white/5 border border-hairline rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold/50 font-mono"
                    />
                  </div>
                </div>

                {newHolding.quantity && newHolding.price && !isNaN(parseFloat(newHolding.quantity)) && !isNaN(parseFloat(newHolding.price)) && (
                  <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-between text-xs">
                    <span className="text-muted">Estimated Market Value:</span>
                    <span className="font-mono font-medium text-gold">
                      ${(parseFloat(newHolding.quantity) * parseFloat(newHolding.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setFormError(""); }}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-muted hover:text-ink transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gold hover:bg-gold/90 text-bg transition-all cursor-pointer"
                  >
                    Add Position
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}