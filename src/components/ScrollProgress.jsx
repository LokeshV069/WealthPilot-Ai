import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress({ containerRef }) {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-gold origin-left z-50" />;
}
