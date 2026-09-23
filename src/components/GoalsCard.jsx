import { motion } from "framer-motion";
import { Target } from "lucide-react";

export default function GoalsCard({ goals, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-premium p-6"
    >
      <p className="font-display text-lg mb-4">Client Goals</p>
      {(goals || []).map((goal, i) => (
        <div key={goal.label} className="mb-4 last:mb-0">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}18` }}>
              <Target size={13} style={{ color: accent }} strokeWidth={1.75} />
            </div>
            <span className="text-sm flex-1">{goal.label}</span>
            <span className="font-mono text-xs text-muted">{goal.progress}%</span>
          </div>
          <div className="h-1.5 bg-hairline rounded-full overflow-hidden ml-9">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, delay: delay + 0.15 + i * 0.1, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}