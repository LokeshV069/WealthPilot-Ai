import { motion } from "framer-motion";

export default function Card({ children, className = "", delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 8px 30px -12px rgba(201,162,39,0.25)" }}
      className={`border border-hairline bg-surface rounded-lg p-5 transition-colors hover:border-gold/30 ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}