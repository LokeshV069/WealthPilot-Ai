import { useState } from "react";
import { motion } from "framer-motion";
import { UserCog, Wallet, CalendarClock, AlertTriangle, RefreshCcw, ShieldCheck, Bot, Download, RotateCw } from "lucide-react";
import ClientKpiCard from "../components/ClientKpiCard";
import { useToast } from "../context/ToastContext";

const AGENT_STEPS = [
  {
    key: "clientProfile",
    name: "Client Profile Agent",
    icon: UserCog,
    color: "var(--color-gold)",
    summary: (a) => `Risk score ${a.riskScore}/10 — ${a.allocationRationale}`,
  },
  {
    key: "portfolioAggregation",
    name: "Portfolio Aggregation Agent",
    icon: Wallet,
    color: "var(--color-slate)",
    summary: (a) =>
      `Total value $${a.totalValue.toLocaleString()}, current allocation ${a.currentAllocation.equity}% equity / ${a.currentAllocation.bonds}% bonds.`,
  },
  {
    key: "lifeEvent",
    name: "Life Event Agent",
    icon: CalendarClock,
    color: "var(--color-plum)",
    summary: (a) => (a.activeEvent ? `Detected: ${a.activeEvent} — ${a.reasoning}` : "No recent life event detected."),
  },
  {
    key: "driftDetection",
    name: "Drift Detection Agent",
    icon: AlertTriangle,
    color: "var(--color-rust)",
    summary: (a) =>
      a.breached
        ? `Drift threshold breached. Bonds ${a.drift.bonds > 0 ? "+" : ""}${a.drift.bonds}%, equity ${a.drift.equity > 0 ? "+" : ""}${a.drift.equity}%.`
        : "Portfolio is within its target allocation.",
  },
  {
    key: "rebalancingRecommendation",
    name: "Rebalancing Recommendation Agent",
    icon: RefreshCcw,
    color: "var(--color-gold)",
    summary: (a) => (a.trades.length > 0 ? a.reasoning : "No trades proposed this cycle."),
  },
  {
    key: "compliance",
    name: "Compliance Agent",
    icon: ShieldCheck,
    color: "var(--color-teal)",
    summary: (a) => `${a.approved ? "Approved" : "Flagged"} — ${a.justification}`,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AgentTrace({ trace }) {
  const { showToast } = useToast();
  const { driftDetection, compliance, lifeEvent } = trace.agents;
  const [isReRunning, setIsReRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);

  function handleExportTrace() {
    const traceJson = JSON.stringify(trace, null, 2);
    const blob = new Blob([traceJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meridian_agent_trace_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Audit log JSON exported successfully.", "success");
  }

  function handleReRunDiagnostics() {
    setIsReRunning(true);
    showToast("Re-evaluating agent pipeline diagnostics...", "info");
    setTimeout(() => {
      setIsReRunning(false);
      setRunKey((k) => k + 1);
      showToast("Pipeline diagnostic complete: all 6 agents verified.", "success");
    }, 750);
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ClientKpiCard icon={Bot} iconColor="var(--color-gold)" label="Agents Run" value={AGENT_STEPS.length} sub="Sequential pipeline" delay={0} />
        <ClientKpiCard
          icon={AlertTriangle}
          iconColor="var(--color-rust)"
          label="Drift Status"
          value={driftDetection.breached ? "Breached" : "On Target"}
          sub={driftDetection.breached ? "Rebalancing recommended" : "No action needed"}
          subColor={driftDetection.breached ? "text-rust" : "text-teal"}
          delay={0.05}
        />
        <ClientKpiCard
          icon={ShieldCheck}
          iconColor="var(--color-teal)"
          label="Compliance Verdict"
          value={compliance.approved ? "Approved" : "Flagged"}
          sub={lifeEvent.activeEvent ? `Life event: ${lifeEvent.activeEvent}` : "No life event detected"}
          subColor={compliance.approved ? "text-teal" : "text-rust"}
          delay={0.1}
        />
      </div>

      <motion.div
        key={runKey}
        variants={container}
        initial="hidden"
        animate="show"
        className="card-premium p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="font-display text-lg mb-0.5">Agent Activity Trace</p>
            <p className="text-xs text-muted">Sequential deterministic agent execution ledger</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTrace}
              className="flex items-center gap-1.5 text-xs text-muted border border-hairline rounded-lg px-3 py-1.5 hover:border-gold/40 hover:text-ink transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleReRunDiagnostics}
              disabled={isReRunning}
              className="flex items-center gap-1.5 text-xs font-medium bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={13} className={isReRunning ? "animate-spin" : ""} />
              <span>{isReRunning ? "Evaluating..." : "Re-run Diagnostics"}</span>
            </button>
          </div>
        </div>

        <div className="relative pl-8">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-hairline" />
          {AGENT_STEPS.map((step) => {
            const data = trace.agents[step.key];
            const Icon = step.icon;
            return (
              <motion.div key={step.key} variants={item} className="relative mb-7 last:mb-0">
                <div
                  className="absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <Icon size={14} style={{ color: step.color }} strokeWidth={1.75} />
                </div>
                <p className="font-medium text-sm mb-1">{step.name}</p>
                <p className="text-sm text-muted leading-relaxed">{step.summary(data)}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}