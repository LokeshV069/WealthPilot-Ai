import { motion } from "framer-motion";
import Sparkline from "./Sparkline";
import StatNumber from "./StatNumber";

export default function HeroStatCard() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-72 rounded-xl p-5 overflow-hidden"
      style={{
        background: "rgba(15, 15, 18, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* animated shine sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.10) 55%, transparent 70%)",
          backgroundSize: "250% 250%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-50% 0%"] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      />

      <div className="relative">
        <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          Total Assets Under Guidance
        </p>
        <p className="font-mono text-2xl mb-1" style={{ color: "#FFFFFF" }}>
          <StatNumber value={236.2} prefix="$" suffix="K" decimals={1} />
        </p>
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "#5FCBA8" }}>
          ↗ +12.4% <span style={{ color: "rgba(255,255,255,0.5)" }}>vs last quarter</span>
        </p>
        <Sparkline data={[210, 215, 218, 222, 227, 231, 236]} color="#D4B84A" />
        <p className="text-xs italic mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          "A clearer tomorrow, for every investor."
        </p>
        <div className="w-8 h-px mt-3" style={{ backgroundColor: "#D4B84A" }} />
      </div>
    </motion.div>
  );
}