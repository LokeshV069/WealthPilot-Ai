import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Wallet, AlertTriangle, ShieldCheck, CalendarClock, ChevronDown, Filter, Check } from "lucide-react";
import ClientKpiCard from "../components/ClientKpiCard";
import ActivityTimeline from "../components/ActivityTimeline";
import AIInsightBanner from "../components/AIInsightBanner";
import GoalsCard from "../components/GoalsCard";
import { ASSET_META } from "../utils/assetMeta";
import { useToast } from "../context/ToastContext";

function AllocationDetailRow({ assetClass, current, target, drift, totalValue, delay }) {
  const meta = ASSET_META[assetClass];
  const Icon = meta.icon;
  const breached = Math.abs(drift) > 5;
  const currentValue = (totalValue * current) / 100;
  const targetValue = (totalValue * target) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="py-4 border-b border-hairline last:border-0"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}18` }}>
          <Icon size={14} style={{ color: meta.color }} strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium flex-1">{meta.label}</span>
        <span className="font-mono text-xs text-muted">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        <span className="font-mono text-xs text-muted/60">/ ${targetValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        <span className={`font-mono text-xs w-14 text-right ${breached ? "text-rust" : "text-teal"}`}>
          {drift > 0 ? "+" : ""}{drift}%
        </span>
      </div>
      <div className="relative h-1.5 bg-hairline rounded-full overflow-hidden ml-11">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(current, 100)}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-ink/30" style={{ left: `${Math.min(target, 100)}%` }} />
      </div>
    </motion.div>
  );
}

const PERIOD_OPTIONS = ["This Month", "This Quarter", "Year to Date", "All Time"];

export default function Overview({ trace, client }) {
  const { showToast } = useToast();
  const { portfolioAggregation, driftDetection, clientProfile } = trace.agents;
  const { totalValue, currentAllocation } = portfolioAggregation;
  const { drift, breached, targetAllocation } = driftDetection;
  const accent = client?.accentColor || "var(--color-gold)";

  const [selectedPeriod, setSelectedPeriod] = useState("This Quarter");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const periodMenuRef = useRef(null);

  const [distributionMode, setDistributionMode] = useState("asset"); // "asset" | "custodian"
  const [distDropdownOpen, setDistDropdownOpen] = useState(false);
  const distMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (periodMenuRef.current && !periodMenuRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
      if (distMenuRef.current && !distMenuRef.current.contains(e.target)) {
        setDistDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breachedCount = Object.values(drift).filter((d) => Math.abs(d) > 5).length;

  const assetDonutData = Object.keys(targetAllocation)
    .filter((k) => currentAllocation[k] > 0)
    .map((k) => ({ name: ASSET_META[k].label, value: currentAllocation[k], color: ASSET_META[k].color }));

  const holdings = client?.holdings || [];
  const custodianTotals = holdings.reduce((acc, h) => {
    acc[h.custodian] = (acc[h.custodian] || 0) + (h.quantity * (h.price || 100));
    return acc;
  }, {});
  const totalCustValue = Object.values(custodianTotals).reduce((a, b) => a + b, 0) || totalValue;
  const CUSTODIAN_COLORS = ["var(--color-gold)", "var(--color-teal)", "var(--color-slate)", "var(--color-plum)"];
  
  const custodianDonutData = Object.keys(custodianTotals).length > 0
    ? Object.keys(custodianTotals).map((cust, i) => ({
        name: cust,
        value: Math.round((custodianTotals[cust] / totalCustValue) * 100),
        color: CUSTODIAN_COLORS[i % CUSTODIAN_COLORS.length],
      }))
    : [
        { name: "Charles Schwab", value: 65, color: "var(--color-gold)" },
        { name: "Fidelity", value: 35, color: "var(--color-teal)" },
      ];

  const activeDonutData = distributionMode === "asset" ? assetDonutData : custodianDonutData;

  const sparkData = client?.performance || [totalValue * 0.95, totalValue * 0.97, totalValue * 0.96, totalValue * 0.99, totalValue];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <ClientKpiCard
          icon={Wallet}
          iconColor="var(--color-gold)"
          label="Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          sub={breached ? "Threshold breached" : "On target"}
          subColor={breached ? "text-rust" : "text-teal"}
          sparkData={sparkData}
          sparkColor="var(--color-gold)"
          delay={0}
        />
        <ClientKpiCard
          icon={AlertTriangle}
          iconColor="var(--color-rust)"
          label="Drift Alerts"
          value={breachedCount}
          sub={breachedCount > 0 ? `${breachedCount} asset class${breachedCount > 1 ? "es" : ""} over threshold` : "No alerts"}
          subColor={breachedCount > 0 ? "text-rust" : "text-teal"}
          delay={0.05}
        />
        <ClientKpiCard
          icon={ShieldCheck}
          iconColor="var(--color-teal)"
          label="Risk Score"
          value={`${clientProfile.riskScore}/10`}
          sub={client?.riskTolerance ? `${client.riskTolerance} tolerance` : undefined}
          delay={0.1}
        />
        <ClientKpiCard
          icon={CalendarClock}
          iconColor="var(--color-gold)"
          label="Next Milestone"
          value={client?.nextMilestone || "—"}
          valueClassName="font-display text-lg"
          sub={client?.activePlan}
          delay={0.15}
        />
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-display text-lg">Allocation vs. Target</p>
            <div className="relative" ref={periodMenuRef}>
              <button
                onClick={() => setPeriodDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted border border-hairline rounded-lg px-2.5 py-1.5 hover:border-gold/40 hover:text-ink transition-colors cursor-pointer"
              >
                <span>{selectedPeriod}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${periodDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {periodDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-36 bg-surface border border-hairline rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                  >
                    {PERIOD_OPTIONS.map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setPeriodDropdownOpen(false);
                          showToast(`Allocation period changed to ${period}`, "info");
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedPeriod === period ? "bg-gold/10 text-gold font-medium" : "text-muted hover:text-ink hover:bg-black/[0.03]"
                        }`}
                      >
                        <span>{period}</span>
                        {selectedPeriod === period && <Check size={12} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs text-muted mb-4">Current weight compared to target ({selectedPeriod})</p>
          {Object.keys(targetAllocation).map((assetClass, i) => (
            <AllocationDetailRow
              key={assetClass}
              assetClass={assetClass}
              current={currentAllocation[assetClass]}
              target={targetAllocation[assetClass]}
              drift={drift[assetClass]}
              totalValue={totalValue}
              delay={0.25 + i * 0.06}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-display text-lg">Portfolio Distribution</p>
            <div className="relative" ref={distMenuRef}>
              <button
                onClick={() => setDistDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted border border-hairline rounded-lg px-2.5 py-1.5 hover:border-gold/40 hover:text-ink transition-colors cursor-pointer"
              >
                <Filter size={11} />
                <span>{distributionMode === "asset" ? "By Asset" : "By Custodian"}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${distDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {distDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-36 bg-surface border border-hairline rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setDistributionMode("asset");
                        setDistDropdownOpen(false);
                        showToast("Displaying breakdown by Asset Class", "info");
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        distributionMode === "asset" ? "bg-gold/10 text-gold font-medium" : "text-muted hover:text-ink hover:bg-black/[0.03]"
                      }`}
                    >
                      <span>By Asset</span>
                      {distributionMode === "asset" && <Check size={12} />}
                    </button>
                    <button
                      onClick={() => {
                        setDistributionMode("custodian");
                        setDistDropdownOpen(false);
                        showToast("Displaying breakdown by Custodian Institution", "info");
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        distributionMode === "custodian" ? "bg-gold/10 text-gold font-medium" : "text-muted hover:text-ink hover:bg-black/[0.03]"
                      }`}
                    >
                      <span>By Custodian</span>
                      {distributionMode === "custodian" && <Check size={12} />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-xs text-muted mb-4">
            Live breakdown {distributionMode === "asset" ? "by asset class" : "by holding custodian"}
          </p>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activeDonutData} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={3} stroke="none">
                    {activeDonutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="font-mono text-lg">${(totalValue / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-muted">Total</p>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {activeDonutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-mono text-muted">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

            <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="border-l-2 pl-5 mb-8"
        style={{ borderColor: accent }}
      >
        <p className="text-xs uppercase tracking-wide text-muted mb-2">Risk Profile</p>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">{clientProfile.allocationRationale}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <ActivityTimeline agents={trace.agents} delay={0.3} />
        <AIInsightBanner reasoning={trace.agents.rebalancingRecommendation.reasoning} delay={0.35} />
        <GoalsCard goals={client?.goals} accent={accent} delay={0.4} />
      </div>
    </div>
  );
}