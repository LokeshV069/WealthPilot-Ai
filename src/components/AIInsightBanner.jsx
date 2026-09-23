import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import heroPhoto from "../assets/hero-photo.jpg";

export default function AIInsightBanner({ reasoning, delay = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-2xl p-6 overflow-hidden flex flex-col justify-between text-white min-h-[220px]"
      style={{
        backgroundImage: `linear-gradient(rgba(20,16,10,0.88), rgba(20,16,10,0.88)), url(${heroPhoto})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
          <Sparkles size={14} className="text-[#D4B84A]" strokeWidth={2} />
        </div>
        <p className="text-[10px] uppercase tracking-wide text-white/50 mb-2">AI Insight</p>
        <p className="text-sm text-white/85 leading-relaxed line-clamp-4">{reasoning}</p>
      </div>
      <button
        onClick={() => navigate("/trace")}
        className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all w-fit mt-4 text-white cursor-pointer font-medium"
      >
        View Full Analysis <ArrowRight size={12} />
      </button>
    </motion.div>
  );
}