import { motion } from "framer-motion";
import Sparkline from "./Sparkline";

export default function ClientKpiCard({ icon: Icon, iconColor, label, value, valueClassName = "font-mono text-2xl", sub, subColor = "text-muted", sparkData, sparkColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      style={{ backgroundImage: `radial-gradient(circle at 100% 0%, ${iconColor}12, transparent 60%)` }}
      className="card-premium p-5 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: iconColor, opacity: 0.7 }} />
      <div className="w-9 h-9 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${iconColor}18` }}>
        <Icon size={16} style={{ color: iconColor }} strokeWidth={2} />
      </div>
      <p className={`${valueClassName} text-ink mb-1`}>{value}</p>
      <p className="text-xs text-muted mb-1.5">{label}</p>
      {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
      {sparkData && (
        <div className="mt-3 opacity-80">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}
    </motion.div>
  );
}