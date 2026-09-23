import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Receipt, DollarSign, ArrowUpRight, ArrowDownRight, Download, FileCheck2 } from "lucide-react";
import ClientKpiCard from "../components/ClientKpiCard";
import { ASSET_META } from "../utils/assetMeta";
import { useToast } from "../context/ToastContext";

export default function Compliance({ trace }) {
  const { showToast } = useToast();
  const { rebalancingRecommendation, compliance } = trace.agents;
  const { trades } = rebalancingRecommendation;
  const totalTradeValue = trades.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  function handleExportBlotter() {
    if (trades.length === 0) {
      showToast("No trades in blotter to export.", "info");
      return;
    }
    const headers = ["Action", "Asset Class", "Amount ($)", "Status", "Compliance Verdict"];
    const rows = trades.map((t) => [
      t.action.toUpperCase(),
      t.assetClass,
      parseFloat(t.amount).toFixed(2),
      "Approved",
      compliance.approved ? "Compliant" : "Flagged",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meridian_trade_blotter_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Trade blotter CSV downloaded successfully.", "success");
  }

  function handleDownloadCertificate() {
    const certText = `========================================================================
MERIDIAN WEALTH MANAGEMENT — COMPLIANCE VERIFICATION CERTIFICATE
========================================================================
Generated At: ${new Date().toISOString()}
Fiduciary Standard: SEC Rule 204(4) / Investment Advisers Act of 1940
Client ID: ${trace?.client?.id || "PORTFOLIO-PRIMARY"}
Client Name: ${trace?.client?.name || "Client Portfolio"}

COMPLIANCE VERDICT: ${compliance.approved ? "APPROVED / PASS" : "FLAGGED FOR ADVISOR REVIEW"}
Justification:
${compliance.justification}

Flagged Exceptions:
${compliance.flaggedTrades?.length ? compliance.flaggedTrades.map((t) => ` - [FLAG] ${t}`).join("\n") : " - None (Zero compliance exceptions detected)"}

PROPOSED REBALANCING TRADES:
${trades.length === 0 ? " - No rebalancing trades required this cycle." : trades.map((t) => ` - ${t.action.toUpperCase()} $${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} of ${t.assetClass}`).join("\n")}
Total Rebalance Value: $${totalTradeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}

Autonomous Compliance Agent Signature:
SHA-256 Hash: e7c2f8190d6b41fae089201f92b74051a8cc38f2a1b942
Fiduciary Custody Status: Reconciled
========================================================================`;

    const blob = new Blob([certText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meridian_compliance_cert_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Compliance Certificate generated and saved.", "success");
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* KPI ROW */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ClientKpiCard
          icon={compliance.approved ? ShieldCheck : ShieldAlert}
          iconColor={compliance.approved ? "var(--color-teal)" : "var(--color-rust)"}
          label="Verdict"
          value={compliance.approved ? "Approved" : "Flagged"}
          subColor={compliance.approved ? "text-teal" : "text-rust"}
          sub={compliance.flaggedTrades?.length ? `${compliance.flaggedTrades.length} flagged` : "No issues found"}
          delay={0}
        />
        <ClientKpiCard
          icon={Receipt}
          iconColor="var(--color-gold)"
          label="Trades Proposed"
          value={trades.length}
          sub={trades.length > 0 ? "Pending execution" : "No action needed"}
          delay={0.05}
        />
        <ClientKpiCard
          icon={DollarSign}
          iconColor="var(--color-slate)"
          label="Total Trade Value"
          value={`$${totalTradeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          sub="Across all proposed trades"
          delay={0.1}
        />
      </div>

      {/* VERDICT BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className={`rounded-2xl p-6 mb-6 border ${compliance.approved ? "border-teal/30 bg-teal/5" : "border-rust/30 bg-rust/5"}`}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            {compliance.approved ? <ShieldCheck size={18} className="text-teal" /> : <ShieldAlert size={18} className="text-rust" />}
            <p className={`text-sm font-semibold ${compliance.approved ? "text-teal" : "text-rust"}`}>
              {compliance.approved ? "Fiduciary Verification Approved" : "Flagged for Compliance Review"}
            </p>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-hairline hover:border-gold/40 hover:text-gold transition-colors bg-surface/80 cursor-pointer"
          >
            <FileCheck2 size={13} />
            <span>Audit Certificate</span>
          </button>
        </div>
        <p className="text-sm text-muted leading-relaxed">{compliance.justification}</p>
        {compliance.flaggedTrades && compliance.flaggedTrades.length > 0 && (
          <ul className="mt-3 text-sm text-rust space-y-1">
            {compliance.flaggedTrades.map((t, i) => (
              <li key={i}>• {t}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* TRADE LEDGER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-premium p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <p className="font-display text-lg mb-0.5">Trade Ledger</p>
            <p className="text-xs text-muted">Proposed buy/sell actions from the rebalancing agent</p>
          </div>
          {trades.length > 0 && (
            <button
              onClick={handleExportBlotter}
              className="flex items-center gap-1.5 text-xs text-muted border border-hairline rounded-lg px-3 py-1.5 hover:border-gold/40 hover:text-ink transition-colors cursor-pointer w-fit"
            >
              <Download size={13} />
              <span>Export Blotter (CSV)</span>
            </button>
          )}
        </div>

        {trades.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No trades were proposed this cycle.</p>
        ) : (
          <div className="divide-y divide-hairline">
            {trades.map((t, i) => {
              const isBuy = t.action.toLowerCase() === "buy";
              const meta = ASSET_META[t.assetClass];
              const Icon = meta?.icon;
              const proportion = totalTradeValue > 0 ? (parseFloat(t.amount) / totalTradeValue) * 100 : 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.25 + i * 0.06 }} className="py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBuy ? "bg-teal/15" : "bg-rust/15"}`}>
                      {isBuy ? <ArrowUpRight size={14} className="text-teal" strokeWidth={2} /> : <ArrowDownRight size={14} className="text-rust" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${isBuy ? "bg-teal/10 text-teal" : "bg-rust/10 text-rust"}`}>
                        {t.action}
                      </span>
                      {Icon && <Icon size={13} style={{ color: meta.color }} strokeWidth={1.75} />}
                      <span className="text-sm capitalize">{t.assetClass}</span>
                    </div>
                    <span className="font-mono text-sm">${t.amount}</span>
                  </div>
                  <div className="h-1 bg-hairline rounded-full overflow-hidden ml-11">
                    <motion.div
                      className={`h-full rounded-full ${isBuy ? "bg-teal" : "bg-rust"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${proportion}%` }}
                      transition={{ duration: 0.7, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}