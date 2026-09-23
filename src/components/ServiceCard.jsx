import { motion } from "framer-motion";
import { useTilt } from "../hooks/useTilt";

export default function ServiceCard({ icon: Icon, color, title, description, delay = 0 }) {
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(4);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: `0 16px 32px -14px ${color}50`, borderColor: `${color}60` }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        borderColor: `${color}25`,
        backgroundImage: `linear-gradient(135deg, ${color}10, transparent 60%)`,
      }}
      className="border bg-white/[0.03] backdrop-blur-xl rounded-xl p-5 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      <p className="font-medium text-sm mb-1.5">{title}</p>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}