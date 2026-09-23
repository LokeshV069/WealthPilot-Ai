import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt";
import { RISK_STYLES, initials } from "../utils/clientDisplay";
import RiskRing from "./RiskRing";
import Sparkline from "./Sparkline";

function percentChange(performance) {
  const first = performance[0];
  const last = performance[performance.length - 1];
  return ((last - first) / first) * 100;
}

export default function ClientCard({ client, breached, onSelect, delay }) {
  const style = RISK_STYLES[client.riskTolerance];
  const change = percentChange(client.performance);
  const positive = change >= 0;
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();

  return (
    <motion.button
      onClick={() => onSelect(client)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{
        y: -5,
        boxShadow: `0 2px 4px rgba(0,0,0,0.06), 0 20px 36px -10px ${client.accentColor}55`,
        borderColor: `${client.accentColor}80`,
      }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        borderColor: `${client.accentColor}30`,
        boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 28px -12px ${client.accentColor}40`,
        backgroundImage: `linear-gradient(135deg, ${client.accentColor}14, transparent 55%)`,
      }}
      className="relative text-left border bg-white/70 backdrop-blur-xl rounded-xl p-4 overflow-hidden transition-colors"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ backgroundColor: client.accentColor, boxShadow: `0 0 12px ${client.accentColor}90` }}
      />

      {breached && (
        <span className="absolute top-3 right-3 flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rust opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rust" />
          </span>
        </span>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            layoutId={`avatar-${client.id}`}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: `${client.accentColor}26`, color: client.accentColor }}
          >
            <RiskRing score={client.riskScore} size={40} strokeColor={client.accentColor} />
            <span className="relative z-10">{initials(client.name)}</span>
          </motion.div>
          <motion.div layoutId={`name-${client.id}`}>
            <p className="font-medium text-sm">{client.name}</p>
            <p className={`text-xs ${style.badge}`}>{client.riskTolerance} risk</p>
          </motion.div>
        </div>
        <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
          client.isLive ? "bg-teal/15 text-teal" : "bg-black/5 text-muted"
        }`}>
          {client.isLive ? "Live" : "Demo"}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-xs text-muted mb-1">Total Assets</p>
          <p className="font-mono text-sm">${client.totalValue.toLocaleString()}</p>
        </div>
        <span className={`font-mono text-xs ${positive ? "text-teal" : "text-rust"}`}>
          {positive ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>
      <Sparkline data={client.performance} color={client.accentColor} />

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border"
          style={{ borderColor: `${client.accentColor}30`, color: client.accentColor }}
        >
          {client.activePlan}
        </span>
      </div>
      <p className="text-xs text-muted mt-2">Next: {client.nextMilestone}</p>
    </motion.button>
  );
}