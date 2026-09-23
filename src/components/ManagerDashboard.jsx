import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Scale,
  TrendingUp,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  UserPlus,
  BarChart3,
  Compass,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { mockClientsExtended } from "../data/mockTrace";
import purposeMountains from "../assets/purpose-mountains.png";

// Activity feed matching screenshot
const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: "Portfolio rebalanced",
    client: "Ananya Rao",
    time: "2 hours ago",
    icon: RefreshCw,
    iconBg: "bg-[#EBF7EE]",
    iconColor: "text-[#2E7D63]",
    dotColor: "bg-[#2E7D63]",
  },
  {
    id: 2,
    title: "Review requested",
    client: "Mark Chen",
    time: "5 hours ago",
    icon: FileText,
    iconBg: "bg-[#FDF0ED]",
    iconColor: "text-[#C14B3A]",
    dotColor: "bg-[#C14B3A]",
  },
  {
    id: 3,
    title: "Client added",
    client: "Priya Nair",
    time: "1 day ago",
    icon: UserPlus,
    iconBg: "bg-[#EDF2F8]",
    iconColor: "text-[#3D6898]",
    dotColor: "bg-[#3D6898]",
  },
  {
    id: 4,
    title: "Risk profile updated",
    client: "Arun Iyer",
    time: "1 day ago",
    icon: BarChart3,
    iconBg: "bg-[#FFF6E5]",
    iconColor: "text-[#B07817]",
    dotColor: "bg-[#B07817]",
  },
];

export default function ManagerDashboard({ onSelect, clients, onAddClient }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showApproachModal, setShowApproachModal] = useState(false);

  // New Client Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRisk, setNewRisk] = useState("Moderate");
  const [newValue, setNewValue] = useState("65000");
  const [newPlan, setNewPlan] = useState("Balanced Growth");
  const [newMilestone, setNewMilestone] = useState("Portfolio Review");

  const clientList = clients || mockClientsExtended;

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    return clientList.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.activePlan && c.activePlan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.riskTolerance && c.riskTolerance.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clientList, searchTerm]);

  // Handle client creation
  function handleCreateClient(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const riskScoreMap = { Low: 3, Moderate: 6, High: 9 };
    const accentColorMap = { Low: "#4FA88F", Moderate: "#C9A227", High: "#C1614A" };
    const numValue = parseFloat(newValue) || 50000;

    const created = {
      id: `C00${clientList.length + 1}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, "")}@meridian.com`,
      password: "client123",
      riskTolerance: newRisk,
      riskScore: riskScoreMap[newRisk] || 6,
      accentColor: accentColorMap[newRisk] || "#C9A227",
      totalValue: numValue,
      performancePct: 2.4,
      performance: [numValue * 0.96, numValue * 0.98, numValue],
      activePlan: newPlan.trim() || "Balanced Growth",
      nextMilestone: newMilestone.trim() || "Annual Review",
      isLive: false,
      status: "Active",
      lastActivity: "Just now",
      goals: [{ label: "Wealth Accumulation", progress: 15 }],
    };

    onAddClient?.(created);
    showToast(`Client ${created.name} successfully enrolled.`, "success");
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewValue("65000");
  }

  // Helper for initials
  function getInitials(name) {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  // Format currency
  function formatCurrency(val) {
    if (val === undefined || val === null) return "$0";
    if (val % 1 !== 0) {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    }
    return `$${val.toLocaleString()}`;
  }

  // Get risk pill styles
  function getRiskBadge(risk) {
    const r = (risk || "moderate").toLowerCase();
    if (r.includes("low")) {
      return { label: "Low risk", className: "bg-[#EDF8F1] text-[#2E7D63]" };
    }
    if (r.includes("high")) {
      return { label: "High risk", className: "bg-[#FDF0ED] text-[#C14B3A]" };
    }
    return { label: "Moderate risk", className: "bg-[#FFF6E5] text-[#B07817]" };
  }

  // Get strategy pill styles
  function getStrategyBadge(strategy) {
    const s = (strategy || "").toLowerCase();
    if (s.includes("aggressive")) {
      return "bg-[#FDF0ED] text-[#B83E2D]";
    }
    if (s.includes("growth")) {
      return "bg-[#FFF9EC] text-[#9A702A]";
    }
    if (s.includes("preservation")) {
      return "bg-[#EDF8F1] text-[#246B54]";
    }
    if (s.includes("balanced")) {
      return "bg-[#EFF5FB] text-[#335F92]";
    }
    return "bg-[#F5F4F0] text-[#5A5752]";
  }

  // Get avatar colors
  function getAvatarColors(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("ananya")) return "bg-[#F4ECE1] text-[#916F38]";
    if (n.includes("mark")) return "bg-[#FDEEEB] text-[#BF4A39]";
    if (n.includes("priya")) return "bg-[#EAF5EE] text-[#2D7C62]";
    if (n.includes("arun")) return "bg-[#EDF2F8] text-[#3D6898]";
    return "bg-[#F0EBE3] text-[#7A6749]";
  }

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6 max-w-[1440px] mx-auto w-full">
      {/* 1. HERO GREETING SECTION */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-7 bg-gradient-to-r from-white via-[#FCFBF8]/95 to-[#F7F4EC]/60 border border-hairline/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Mountain background illustration on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none">
          <img
            src={purposeMountains}
            alt=""
            className="w-full h-full object-cover object-left opacity-35 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-xl">
            <p className="text-xs text-muted font-normal">Good Afternoon,</p>
            <h1 className="font-display text-4xl font-normal tracking-tight text-ink mt-0.5 mb-0.5">
              {user?.name || "Lokesh V"}
            </h1>
            <p className="text-xs text-muted font-normal">Wealth Manager</p>
            <p className="italic font-display text-xs text-muted/90 mt-3">
              “Helping people build wealth for what matters most.”
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-xs text-muted/80 font-normal">Tue, Sep 22, 2026</p>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center pl-6 border-l border-hairline/60">
              <span className="text-[9.5px] tracking-[0.25em] font-medium text-muted/80 uppercase leading-relaxed text-center">
                DISCIPLINE<br />CREATES<br />FREEDOM
              </span>
              <div className="w-0.5 h-6 bg-gold/70 mt-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Card 1: Total Clients */}
        <div className="bg-white rounded-2xl p-5 border border-hairline/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#2E7D63] shrink-0">
              <Users size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs text-muted font-normal">Total Clients</p>
              <p className="text-3xl font-display font-medium text-ink tracking-tight mt-0.5">56</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} className="text-[#2E7D63]" />
                <span className="text-[11px] font-semibold text-[#2E7D63]">+8%</span>
                <span className="text-[11px] text-muted ml-0.5">vs last month</span>
              </div>
            </div>
          </div>
          {/* Smooth wave sparkline */}
          <div className="w-24 h-10 flex items-center justify-end pr-1">
            <svg className="w-24 h-9 overflow-visible" viewBox="0 0 100 36" fill="none">
              <path
                d="M 2 24 C 20 24, 32 30, 48 22 C 64 14, 76 8, 98 10"
                stroke="#2E7D63"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-hairline/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF7E8] flex items-center justify-center text-[#C98A2C] shrink-0">
              <FileText size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs text-muted font-normal">Pending Reviews</p>
              <p className="text-3xl font-display font-medium text-ink tracking-tight mt-0.5">8</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} className="text-[#C14B3A]" />
                <span className="text-[11px] font-semibold text-[#C14B3A]">+2%</span>
                <span className="text-[11px] text-muted ml-0.5">vs last week</span>
              </div>
            </div>
          </div>
          {/* Smooth wave sparkline */}
          <div className="w-24 h-10 flex items-center justify-end pr-1">
            <svg className="w-24 h-9 overflow-visible" viewBox="0 0 100 36" fill="none">
              <path
                d="M 2 28 C 22 28, 38 32, 52 26 C 68 20, 80 14, 98 18"
                stroke="#C98A2C"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Rebalancing Actions */}
        <div className="bg-white rounded-2xl p-5 border border-hairline/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF7F5] flex items-center justify-center text-[#2F8F76] shrink-0">
              <Scale size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs text-muted font-normal">Rebalancing Actions</p>
              <p className="text-3xl font-display font-medium text-ink tracking-tight mt-0.5">12</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} className="text-[#2E7D63]" />
                <span className="text-[11px] font-semibold text-[#2E7D63]">+3%</span>
                <span className="text-[11px] text-muted ml-0.5">vs last week</span>
              </div>
            </div>
          </div>
          {/* Smooth wave sparkline */}
          <div className="w-24 h-10 flex items-center justify-end pr-1">
            <svg className="w-24 h-9 overflow-visible" viewBox="0 0 100 36" fill="none">
              <path
                d="M 2 26 C 18 26, 28 16, 46 22 C 64 28, 76 14, 98 15"
                stroke="#2F8F76"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Client Portfolio Overview + Guiding Wealth Forward (~68% width) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Client Portfolio Overview Table Card */}
          <div className="bg-white rounded-2xl p-6 border border-hairline/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-xl font-normal text-ink">Client Portfolio Overview</h2>
                <p className="text-xs text-muted mt-0.5">A snapshot of your clients and their portfolio status.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-hairline bg-[#FAF9F7] text-xs text-ink w-48 focus-within:border-gold/50 focus-within:bg-white transition-all">
                  <Search size={13} className="text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent focus:outline-none placeholder:text-muted/60 text-xs text-ink"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  title="Add Client"
                  className="p-1.5 rounded-xl border border-hairline hover:border-gold/40 hover:bg-gold/10 text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0EDE8] text-[11px] font-medium text-[#7C7A75]">
                    <th className="pb-3 pl-2 font-medium">Client</th>
                    <th className="pb-3 px-3 font-medium">Risk Level</th>
                    <th className="pb-3 px-3 font-medium">Total Assets</th>
                    <th className="pb-3 px-3 font-medium">Performance</th>
                    <th className="pb-3 px-3 font-medium">Strategy</th>
                    <th className="pb-3 px-3 font-medium">Next Review</th>
                    <th className="pb-3 px-3 font-medium text-center">Status</th>
                    <th className="pb-3 pr-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F4F0]">
                  {filteredClients.map((client) => {
                    const risk = getRiskBadge(client.riskTolerance);
                    const perf = client.performancePct ?? 1.1;
                    const isPositive = perf >= 0;

                    return (
                      <tr
                        key={client.id}
                        className="group hover:bg-[#FAF9F6] transition-colors"
                      >
                        {/* Client column: avatar circle + name */}
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold tracking-wider shrink-0 ${getAvatarColors(client.name)}`}
                            >
                              {getInitials(client.name)}
                            </div>
                            <span className="text-xs font-semibold text-[#1F1E1B] tracking-tight">
                              {client.name}
                            </span>
                          </div>
                        </td>

                        {/* Risk Level badge */}
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${risk.className}`}>
                            {risk.label}
                          </span>
                        </td>

                        {/* Total Assets */}
                        <td className="py-3.5 px-3 text-xs font-semibold text-[#1F1E1B]">
                          {formatCurrency(client.totalValue)}
                        </td>

                        {/* Performance */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-xs font-semibold ${
                              isPositive ? "text-[#2E7D63]" : "text-[#C14B3A]"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {perf}%
                          </span>
                        </td>

                        {/* Strategy pill */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStrategyBadge(
                              client.activePlan
                            )}`}
                          >
                            {client.activePlan || "Growth Strategy"}
                          </span>
                        </td>

                        {/* Next Review */}
                        <td className="py-3.5 px-3 text-xs text-[#6F6D68]">
                          {client.nextMilestone || "Annual Review"}
                        </td>

                        {/* Status badge: LIVE or DEMO */}
                        <td className="py-3.5 px-3 text-center">
                          {client.isLive ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#2E7D63] text-[9.5px] font-bold uppercase tracking-wider">
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#F0EEEB] text-[#7A7772] text-[9.5px] font-bold uppercase tracking-wider">
                              DEMO
                            </span>
                          )}
                        </td>

                        {/* Action: Circular Arrow Button */}
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => onSelect?.(client)}
                            title={`Open console for ${client.name}`}
                            className="w-7 h-7 rounded-full border border-[#DFDAD2] hover:border-[#1F1E1B] text-[#4A4844] hover:text-[#1F1E1B] hover:bg-black/[0.04] inline-flex items-center justify-center transition-all cursor-pointer shadow-xs group-hover:border-[#9A9790]"
                          >
                            <ArrowRight size={13} strokeWidth={2} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-muted">
                        No clients found matching &ldquo;{searchTerm}&rdquo;.
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-gold font-medium ml-2 hover:underline"
                        >
                          Clear search
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Banner: Guiding Wealth Forward */}
          <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-r from-white via-[#FCFBF9]/90 to-[#F5F2EA]/60 border border-hairline/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
            {/* Watermark mountains in background */}
            <div className="absolute right-16 top-0 bottom-0 w-[45%] pointer-events-none overflow-hidden select-none">
              <img
                src={purposeMountains}
                alt=""
                className="w-full h-full object-cover object-left opacity-30 mix-blend-multiply"
              />
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-gold/20 flex items-center justify-center text-gold shrink-0">
                <Compass size={18} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-display text-base font-normal text-ink">Guiding Wealth Forward.</h3>
                <p className="text-xs text-muted mt-0.5">
                  Data-driven insights. Personalized guidance. A more secure tomorrow.
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => setShowApproachModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 border border-[#DFDAD2] hover:border-gold/60 text-xs font-medium text-ink shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <span>Our Approach</span>
                <ArrowRight size={13} className="text-gold" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Portfolio Health + Recent Activity (~32% width) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Portfolio Health Card */}
          <div className="bg-white rounded-2xl p-6 border border-hairline/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-normal text-ink">Portfolio Health</h3>
                <button
                  onClick={() => setShowHealthModal(true)}
                  className="text-xs text-[#B88628] hover:text-[#916719] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View Details <ArrowRight size={12} />
                </button>
              </div>

              {/* Donut Chart and Legend */}
              <div className="flex items-center justify-between gap-3 py-3">
                {/* SVG Donut Chart with center label */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#F4F1EA"
                      strokeWidth="10"
                    />
                    {/* Low Risk Segment: 32% (dark teal #1D6F58) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#1D6F58"
                      strokeWidth="10"
                      strokeDasharray="76.4 238.76"
                      strokeDashoffset="0"
                    />
                    {/* Moderate Risk Segment: 48% (amber gold #D49526) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#D49526"
                      strokeWidth="10"
                      strokeDasharray="114.6 238.76"
                      strokeDashoffset="-76.4"
                    />
                    {/* High Risk Segment: 20% (rust coral #B54838) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#B54838"
                      strokeWidth="10"
                      strokeDasharray="47.75 238.76"
                      strokeDashoffset="-191.0"
                    />
                  </svg>

                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display text-xl font-bold text-ink leading-none">56</span>
                    <span className="text-[10px] text-muted font-normal mt-0.5">Clients</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2.5 flex-1 pl-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1D6F58]" />
                      <span className="text-muted font-normal">Low Risk</span>
                    </div>
                    <span className="font-semibold text-ink">32%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D49526]" />
                      <span className="text-muted font-normal">Moderate Risk</span>
                    </div>
                    <span className="font-semibold text-ink">48%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B54838]" />
                      <span className="text-muted font-normal">High Risk</span>
                    </div>
                    <span className="font-semibold text-ink">20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quote */}
            <div className="pt-3 border-t border-[#F3F0EA] mt-3">
              <p className="italic font-display text-xs text-muted/80 text-center">
                “A well-balanced tomorrow starts today.”
              </p>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl p-6 border border-hairline/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-normal text-ink">Recent Activity</h3>
              <button
                onClick={() => setShowActivityModal(true)}
                className="text-xs text-[#B88628] hover:text-[#916719] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            {/* Timeline List */}
            <div className="space-y-4 relative">
              {RECENT_ACTIVITIES.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 relative">
                    {/* Small vertical connector line if not last */}
                    {idx < RECENT_ACTIVITIES.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-16px] w-[1px] bg-[#EFECE6]" />
                    )}

                    {/* Circular Icon Pill */}
                    <div
                      className={`w-8 h-8 rounded-full ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0 relative z-10 shadow-xs`}
                    >
                      <Icon size={14} strokeWidth={2} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-[#1F1E1B] leading-snug">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-muted leading-tight mt-0.5">
                        {activity.client}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-[10px] text-muted whitespace-nowrap pt-0.5">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD CLIENT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-md bg-white border border-hairline rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
              <h3 className="font-display text-lg font-normal text-ink mb-0.5">Add New Client</h3>
              <p className="text-xs text-muted mb-4">Enroll a new investor into Meridian Wealth Console.</p>

              <form onSubmit={handleCreateClient} className="space-y-3">
                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohini Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1 block font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rohini@meridian.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block font-medium">Risk Tolerance</label>
                    <select
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Moderate">Moderate Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted mb-1 block font-medium">Total Assets ($)</label>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block font-medium">Strategy</label>
                    <input
                      type="text"
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      placeholder="e.g. Balanced Growth"
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted mb-1 block font-medium">Next Review</label>
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="e.g. Portfolio Review"
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F7] border border-hairline rounded-xl focus:outline-none focus:border-gold/60 focus:bg-white text-ink transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 text-xs rounded-xl border border-hairline hover:bg-black/[0.03] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs rounded-xl bg-[#B88628] hover:bg-[#A3741E] text-white font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    Create Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PORTFOLIO HEALTH DETAILS */}
      <AnimatePresence>
        {showHealthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-lg bg-white border border-hairline rounded-2xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setShowHealthModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={18} className="text-[#1D6F58]" />
                <h3 className="font-display text-lg font-normal text-ink">Portfolio Health & Risk Calibration</h3>
              </div>
              <p className="text-xs text-muted mb-4">
                Detailed aggregate breakdown across 56 managed client portfolios under Meridian custody.
              </p>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                {/* 3 Tier Cards */}
                <div className="p-3.5 rounded-xl bg-[#EDF8F1] border border-[#D0EDE0] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1D6F58]">Low Risk Tier (32%)</p>
                    <p className="text-[11px] text-[#2E7D63] mt-0.5">18 Portfolios • Avg Volatility 4.2%</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#1D6F58]">$1.42M AUM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF7E8] border border-[#FBE3B5] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#B07817]">Moderate Risk Tier (48%)</p>
                    <p className="text-[11px] text-[#C98A2C] mt-0.5">27 Portfolios • Avg Volatility 8.6%</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#B07817]">$2.85M AUM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FDF0ED] border border-[#F6D5CE] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#B54838]">High Risk Tier (20%)</p>
                    <p className="text-[11px] text-[#C14B3A] mt-0.5">11 Portfolios • Avg Volatility 14.8%</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#B54838]">$1.68M AUM</span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF9F7] border border-hairline space-y-2">
                  <div className="flex items-center gap-2 text-ink font-semibold">
                    <CheckCircle2 size={15} className="text-[#2E7D63]" />
                    <span>Suitability Compliance Status: 100% Verified</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    All rebalancing triggers and target allocation bands strictly respect FINRA Rule 2111 (Suitability) and SEC fiduciary guidelines. Rebalancing thresholds are monitored in real time with 5-minute telemetry intervals.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline mt-4 flex justify-end">
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-[#17171A] text-white hover:opacity-90 transition-opacity cursor-pointer font-medium"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ACTIVITY AUDIT TRAIL */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-lg bg-white border border-hairline rounded-2xl shadow-2xl p-6 relative max-h-[80vh] flex flex-col"
            >
              <button
                onClick={() => setShowActivityModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
              <h3 className="font-display text-lg font-normal text-ink mb-0.5">Recent Activity Audit Trail</h3>
              <p className="text-xs text-muted mb-4">
                Complete chronological log of recent client actions, rebalancing, and reviews.
              </p>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {[
                  ...RECENT_ACTIVITIES,
                  {
                    id: 5,
                    title: "Quarterly rebalance check",
                    client: "Arun Iyer",
                    time: "2 days ago",
                    icon: RefreshCw,
                    iconBg: "bg-[#FFF6E5]",
                    iconColor: "text-[#B07817]",
                  },
                  {
                    id: 6,
                    title: "KYC verification completed",
                    client: "Priya Nair",
                    time: "3 days ago",
                    icon: CheckCircle2,
                    iconBg: "bg-[#EBF7EE]",
                    iconColor: "text-[#2E7D63]",
                  },
                  {
                    id: 7,
                    title: "Dividend reinvested ($420)",
                    client: "Mark Chen",
                    time: "4 days ago",
                    icon: BarChart3,
                    iconBg: "bg-[#EDF2F8]",
                    iconColor: "text-[#3D6898]",
                  },
                  {
                    id: 8,
                    title: "Asset allocation threshold alert",
                    client: "Ananya Rao",
                    time: "5 days ago",
                    icon: AlertCircle,
                    iconBg: "bg-[#FDF0ED]",
                    iconColor: "text-[#C14B3A]",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF9F7] border border-hairline"
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Icon size={13} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink">{item.title}</p>
                        <p className="text-[11px] text-muted">{item.client}</p>
                      </div>
                      <span className="text-[10px] text-muted shrink-0">{item.time}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-hairline mt-4 flex justify-end">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-[#17171A] text-white hover:opacity-90 transition-opacity cursor-pointer font-medium"
                >
                  Close Audit Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: OUR APPROACH */}
      <AnimatePresence>
        {showApproachModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-lg bg-white border border-hairline rounded-2xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setShowApproachModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>

              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#FAF5EB] border border-gold/20 flex items-center justify-center text-gold">
                  <Compass size={16} strokeWidth={2} />
                </div>
                <h3 className="font-display text-lg font-normal text-ink">Our Investment Approach</h3>
              </div>
              <p className="text-xs text-muted mb-4">
                How Meridian blends autonomous AI precision with fiduciary integrity to safeguard and grow generational wealth.
              </p>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF9F7] border border-hairline">
                  <h4 className="font-semibold text-ink text-xs mb-1">1. Autonomous Drift Detection</h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    We continuously monitor asset allocation across equities, fixed income, cash, and alternative assets. When market movements shift exposures beyond client-calibrated tolerance thresholds, rebalancing events are triggered automatically.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F7] border border-hairline">
                  <h4 className="font-semibold text-ink text-xs mb-1">2. Fiduciary Suitability Verification</h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Every proposed order is screened against the client&apos;s risk tolerance score, current liquidity needs, and tax profile before execution. No trades proceed without explicit regulatory approval.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F7] border border-hairline">
                  <h4 className="font-semibold text-ink text-xs mb-1">3. Life-Stage Dynamic Calibration</h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Major milestones—promotions, home purchases, retirement horizons—dynamically recalibrate allocation glide paths, ensuring investments remain synchronized with real-world goals.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline mt-4 flex justify-end">
                <button
                  onClick={() => setShowApproachModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-[#B88628] text-white hover:bg-[#A3741E] transition-colors cursor-pointer font-medium"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}