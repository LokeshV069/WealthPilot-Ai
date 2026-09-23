import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTilt } from "../hooks/useTilt";

export default function SolutionCard({ icon: Icon, title, description, delay = 0 }) {
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(4);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, borderColor: "rgba(201,162,39,0.4)" }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative border border-hairline bg-white/[0.02] rounded-xl p-5 transition-colors"
    >
      <div className="w-11 h-11 rounded-full bg-gold/12 flex items-center justify-center mb-4">
        <Icon size={19} className="text-gold" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-sm mb-1.5">{title}</p>
      <p className="text-xs text-muted leading-relaxed pr-6">{description}</p>
      <div className="absolute bottom-5 right-5 w-7 h-7 rounded-full border border-hairline flex items-center justify-center">
        <ArrowRight size={12} className="text-muted" />
      </div>
    </motion.div>
  );
}