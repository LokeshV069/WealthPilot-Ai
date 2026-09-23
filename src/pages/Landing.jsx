import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  ShieldCheck,
  PlayCircle,
  ArrowRight,
  Activity,
  ChevronDown,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Lock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SolutionCard from "../components/SolutionCard";
import ScrollProgress from "../components/ScrollProgress";
import StatNumber from "../components/StatNumber";
import heroPhoto from "../assets/hero-photo.jpg";
import trustPhoto from "../assets/trust-photo.jpg";
import purposeMountains from "../assets/purpose-mountains.png";
import HeroStatCard from "../components/HeroStatCard";

const SOLUTIONS = [
  { icon: Users, title: "Client Portfolio Management", description: "Get a complete view of your clients' assets, goals, and progress." },
  { icon: BarChart3, title: "Smart Rebalancing", description: "Stay aligned with goals through data-driven recommendations." },
  { icon: ShieldCheck, title: "Risk & Compliance Support", description: "Built-in tools to help you manage risk and stay compliant." },
  { icon: Activity, title: "Actionable Insights", description: "Turn data into meaningful conversations." },
];

const STATS = [
  { value: 500, suffix: "+", label: "Advisors" },
  { value: 25000, suffix: "+", label: "Clients" },
  { value: 5000, prefix: "$", suffix: "+", label: "Assets Under Guidance" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

function SectionEyebrow({ children }) {
  return (
    <div className="mb-2">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{children}</p>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
        className="h-px w-10 bg-gold"
      />
    </div>
  );
}

export default function Landing({ onSignIn }) {
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const trustRef = useRef(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoChapter, setActiveVideoChapter] = useState(0);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    container: scrollRef,
    offset: ["start start", "end start"],
  });
  const heroTextOpacity = useTransform(heroProgress, [0, 1], [1, 0]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 60]);
  const heroBgY = useTransform(heroProgress, [0, 1], [0, -50]);

  const { scrollYProgress: trustProgress } = useScroll({
    target: trustRef,
    container: scrollRef,
    offset: ["start end", "end start"],
  });
  const trustBgY = useTransform(trustProgress, [0, 1], [-40, 40]);

  function scrollToId(id) {
    if (id === "top") {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  const VIDEO_CHAPTERS = [
    { title: "Multi-Custodian Ingestion", time: "00:24", desc: "Live API synchronization with Charles Schwab & Fidelity." },
    { title: "Autonomous 6-Agent Pipeline", time: "01:05", desc: "Profile scoring, drift calculation, and rebalancing recommendations." },
    { title: "Fiduciary Compliance Verification", time: "02:18", desc: "SEC guardrails audit and trade blotter order dispatch." },
  ];

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto bg-bg text-ink">
      <ScrollProgress containerRef={scrollRef} />
      <Navbar onSignIn={onSignIn} onScrollTo={scrollToId} />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden px-8 py-16 min-h-[85vh] flex flex-col justify-center">
        <motion.div
          style={{
            y: heroBgY,
            backgroundImage: `linear-gradient(90deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.55) 42%, rgba(11,11,12,0.15) 65%, transparent 100%), url(${heroPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="pointer-events-none absolute inset-0"
        />

        <div className="hidden lg:flex flex-col items-end gap-1 absolute top-16 right-10 text-white/70 text-xs uppercase tracking-[0.3em] z-10 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
          <span>Discipline</span>
          <span>Creates</span>
          <span>Freedom</span>
        </div>

        <motion.div style={{ opacity: heroTextOpacity, y: heroTextY }} className="relative max-w-lg z-10">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs uppercase tracking-wide text-gold mb-3">
            Wealth. Guided by Clarity.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-5xl leading-[1.1] mb-3 text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]"
          >
            Smarter Wealth for Brighter Tomorrows.
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="h-px w-16 bg-gold mb-6"
          />

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-white/80 text-base leading-relaxed mb-8 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            Meridian Wealth Console empowers advisors and clients with intelligent insights, seamless portfolio management, and a more secure financial future.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex items-center gap-3 mb-10">
            <button onClick={onSignIn} className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg bg-gold/90 hover:bg-gold text-bg font-medium transition-colors cursor-pointer">
              Explore Our Platform <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setVideoModalOpen(true)}
              className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg border border-white/25 text-white hover:border-white/50 transition-colors cursor-pointer"
            >
              <PlayCircle size={15} strokeWidth={1.75} />
              Watch Video
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-6 text-xs text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
            <span className="flex items-center gap-1.5"><BarChart3 size={14} strokeWidth={1.75} /> Data-Driven Insights</span>
            <span className="flex items-center gap-1.5"><Users size={14} strokeWidth={1.75} /> Personalized Guidance</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} strokeWidth={1.75} /> Built for Trust</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ opacity: heroTextOpacity }}
          className="hidden lg:block absolute top-24 right-[26%] z-10"
        >
          <HeroStatCard />
        </motion.div>

        <motion.button
          onClick={() => scrollToId("solutions")}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 hover:text-gold transition-colors z-10 cursor-pointer"
        >
          <ChevronDown size={22} strokeWidth={1.5} />
        </motion.button>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="px-8 py-20 bg-white/[0.015]">
        <div className="flex items-end justify-between mb-10 max-w-5xl">
          <div>
            <SectionEyebrow>Our Solutions</SectionEyebrow>
            <h2 className="font-display text-3xl">Everything You Need to Manage Wealth, Better.</h2>
          </div>
          <p className="text-sm text-muted max-w-xs text-right hidden md:block">
            From portfolio tracking to intelligent recommendations, Meridian simplifies wealth management for advisors and clients alike.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4 max-w-5xl">
          {SOLUTIONS.map((s, i) => (
            <SolutionCard key={s.title} {...s} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* TRUST BANNER */}
      <section ref={trustRef} className="relative overflow-hidden px-8 py-16 text-ink">
        <motion.div
          style={{
            y: trustBgY,
            backgroundImage: `linear-gradient(rgba(6,6,7,0.55), rgba(6,6,7,0.55)), url(${trustPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="pointer-events-none absolute -inset-y-10 inset-x-0"
        />
        <div className="relative grid grid-cols-2 lg:grid-cols-6 gap-8 items-center max-w-6xl">
          <div className="lg:col-span-1">
            <p className="text-xs uppercase tracking-wide text-white/70 leading-relaxed mb-2">Trusted by Advisors.<br />Built for Investors.</p>
            <div className="w-8 h-px bg-gold mb-2" />
            <p className="text-xs text-white/60">Real people. Real progress.</p>
          </div>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="lg:col-span-1"
            >
              <p className="font-display text-2xl mb-1 text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
                <StatNumber value={s.value} prefix={s.prefix || ""} suffix={s.suffix || ""} />
              </p>
              <p className="text-xs text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">{s.label}</p>
            </motion.div>
          ))}
          <div className="lg:col-span-1 text-sm text-white/80 italic leading-relaxed border-l border-white/20 pl-4">
            &ldquo;Meridian has transformed the way we manage and grow client relationships.&rdquo;
            <p className="text-xs text-gold not-italic mt-2">— Partner, Wealth Advisory Firm</p>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section
        id="purpose"
        className="relative overflow-hidden px-8 md:px-16 py-16 md:py-24 border-t border-hairline min-h-[380px] flex items-center justify-between"
        style={{
          backgroundColor: "#F4F2EE",
          backgroundImage: `url(${purposeMountains})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        <div className="relative z-10 max-w-xl">
          <SectionEyebrow>Our Purpose</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-[1.2] mb-4">
            Guiding People Towards Financial Freedom.
          </h2>
          <p className="text-sm md:text-base text-muted leading-relaxed mb-6 max-w-lg">
            At Meridian, we combine intelligent insights, human expertise, and innovative technology to help people build, protect, and grow their wealth.
          </p>
          <button
            onClick={() => setAboutModalOpen(true)}
            className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg border border-hairline bg-surface/70 hover:border-gold/50 hover:text-gold backdrop-blur-sm transition-all shadow-sm w-fit cursor-pointer font-medium"
          >
            About Meridian <ArrowRight size={14} />
          </button>
        </div>

        {/* Right side branded motto with vertical gold bars */}
        <div className="hidden lg:flex flex-col items-center justify-center pl-8 z-10">
          <div className="w-px h-10 bg-gold mb-3 opacity-90" />
          <div className="text-[10px] tracking-[0.25em] text-muted uppercase font-medium text-center space-y-1 leading-snug">
            <p>Wealth</p>
            <p>Guided By</p>
            <p>Clarity</p>
          </div>
          <div className="w-px h-10 bg-gold mt-3 opacity-90" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-hairline flex items-center justify-between">
        <p className="text-xs text-gold">Guiding Wealth Forward.</p>
        <p className="text-[10px] text-muted">© 2026 Meridian Wealth Console — demo project</p>
      </footer>

      {/* VIDEO PREVIEW MODAL */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface border border-hairline rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              {/* VIDEO HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-black/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                    <PlayCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-base">Meridian Platform Tour</h3>
                    <p className="text-[11px] text-muted">Autonomous Multi-Agent Wealth Pipeline in Action</p>
                  </div>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SIMULATED VIDEO PLAYER */}
              <div className="relative aspect-video bg-gradient-to-br from-[#121418] via-[#1a1d24] to-[#0d0e12] flex flex-col justify-between p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#D4B84A_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rust/20 border border-rust/40 text-rust text-[10px] font-mono uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rust" /> Live Demo Mode
                  </span>
                  <span className="text-xs font-mono text-white/60">02:45 / 03:12</span>
                </div>

                <div className="relative z-10 text-center my-auto">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-gold/30 transition-all text-gold shadow-[0_0_30px_rgba(212,184,74,0.3)]"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Play size={24} className="ml-0.5" /> : <Pause size={24} />}
                  </motion.div>
                  <p className="font-display text-xl text-white mb-1">
                    {VIDEO_CHAPTERS[activeVideoChapter].title}
                  </p>
                  <p className="text-xs text-white/70 max-w-sm mx-auto">
                    {VIDEO_CHAPTERS[activeVideoChapter].desc}
                  </p>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gold transition-all duration-300"
                      style={{ width: `${((activeVideoChapter + 1) / VIDEO_CHAPTERS.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60 pt-1">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition-colors cursor-pointer">
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white transition-colors cursor-pointer">
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-gold font-mono">1080p HD · 60 FPS</span>
                  </div>
                </div>
              </div>

              {/* CHAPTER TABS & ACTIONS */}
              <div className="p-6 bg-surface">
                <p className="text-xs uppercase tracking-wide text-muted mb-3">Interactive Segments</p>
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {VIDEO_CHAPTERS.map((chap, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVideoChapter(i)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeVideoChapter === i
                          ? "border-gold/50 bg-gold/10"
                          : "border-hairline hover:border-white/20 bg-black/[0.02]"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-muted block mb-0.5">{chap.time}</span>
                      <p className="text-xs font-medium line-clamp-1 text-ink">{chap.title}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-hairline">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Sparkles size={13} className="text-gold" />
                    <span>Real-time agent trace execution</span>
                  </div>
                  <button
                    onClick={() => { setVideoModalOpen(false); onSignIn(); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold hover:bg-gold/90 text-bg text-xs font-medium transition-all cursor-pointer shadow-md"
                  >
                    Launch Interactive Console <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABOUT MERIDIAN MODAL */}
      <AnimatePresence>
        {aboutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface border border-hairline rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg">About Meridian Wealth</h3>
                    <p className="text-xs text-muted">Founded 2026 · Built for Institutional Fiduciaries</p>
                  </div>
                </div>
                <button
                  onClick={() => setAboutModalOpen(false)}
                  className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-6 text-sm text-muted leading-relaxed">
                <p>
                  Meridian Wealth Console was engineered to solve the fragmented reality of high-net-worth advisory: disparate custodian accounts, delayed rebalancing calculations, and manual compliance signoffs.
                </p>
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="p-3 rounded-xl bg-black/[0.02] border border-hairline">
                    <p className="text-[10px] uppercase tracking-wide text-muted mb-0.5">Assets Advised</p>
                    <p className="font-mono text-xl text-ink font-semibold">$5.0B+</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/[0.02] border border-hairline">
                    <p className="text-[10px] uppercase tracking-wide text-muted mb-0.5">Fiduciary Standard</p>
                    <p className="font-display text-lg text-ink font-semibold">100% Rule 204(4)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink pt-1">
                  <Lock size={14} className="text-teal shrink-0" />
                  <span>SOC2 Type II Certified · 256-bit AES Encryption</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  onClick={() => setAboutModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => { setAboutModalOpen(false); onSignIn(); }}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-gold hover:bg-gold/90 text-bg transition-all cursor-pointer shadow-md"
                >
                  Open Advisor Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}