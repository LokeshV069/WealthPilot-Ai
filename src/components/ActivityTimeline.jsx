import { motion } from "framer-motion";
import { CalendarClock, AlertTriangle, RefreshCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

function buildTimeline(agents) {
  const items = [];

  items.push({
    icon: agents.compliance.approved ? ShieldCheck : AlertTriangle,
    color: agents.compliance.approved ? "var(--color-teal)" : "var(--color-rust)",
    title: agents.compliance.approved ? "Trades approved by compliance" : "Trades flagged for review",
    time: "2 hours ago",
  });

  if (agents.rebalancingRecommendation.trades.length > 0) {
    items.push({
      icon: RefreshCcw,
      color: "var(--color-gold)",
      title: `Rebalancing proposed — ${agents.rebalancingRecommendation.trades.length} trade${agents.rebalancingRecommendation.trades.length > 1 ? "s" : ""}`,
      time: "3 hours ago",
    });
  } else {
    items.push({
      icon: CheckCircle2,
      color: "var(--color-teal)",
      title: "No rebalancing needed this cycle",
      time: "3 hours ago",
    });
  }

  items.push({
    icon: AlertTriangle,
    color: agents.driftDetection.breached ? "var(--color-rust)" : "var(--color-teal)",
    title: agents.driftDetection.breached ? "Drift threshold breached" : "Portfolio within target allocation",
    time: "1 day ago",
  });

  if (agents.lifeEvent.activeEvent) {
    items.push({
      icon: CalendarClock,
      color: "var(--color-slate)",
      title: `Life event detected: ${agents.lifeEvent.activeEvent}`,
      time: "3 days ago",
    });
  }

  return items;
}

export default function ActivityTimeline({ agents, delay = 0 }) {
  const items = buildTimeline(agents);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-premium p-6"
    >
      <p className="font-display text-lg mb-4">Recent Activity</p>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-hairline" />
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: delay + 0.1 + i * 0.08 }}
              className="relative mb-5 last:mb-0"
            >
              <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-surface" style={{ backgroundColor: item.color }} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Icon size={14} style={{ color: item.color }} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-snug">{item.title}</p>
                </div>
                <p className="text-[11px] text-muted whitespace-nowrap shrink-0">{item.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}