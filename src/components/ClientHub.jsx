import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Users, Scale, TrendingUp, TrendingDown } from "lucide-react";
import Card from "./Card";
import Sparkline from "./Sparkline";
import ClientCard from "./ClientCard";
import { mockClientsExtended, mockTracesById } from "../data/mockTrace";

function KpiCard({ icon: Icon, iconColor, label, value, trend, sparkData, sparkColor, delay }) {
  const positive = trend >= 0;
  return (
    <Card delay={delay}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${iconColor}20` }}>
          <Icon size={16} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      </div>
      <p className="font-mono text-2xl mb-1">{value}</p>
      <p className={`text-xs flex items-center gap-1 mb-2 ${positive ? "text-teal" : "text-rust"}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {positive ? "+" : ""}{trend}% <span className="text-muted">vs last month</span>
      </p>
      <Sparkline data={sparkData} color={sparkColor} />
    </Card>
  );
}

export default function ClientHub({ onSelect }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const filteredClients = mockClientsExtended.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === "All" || c.riskTolerance === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const totalAUM = mockClientsExtended.reduce((s, c) => s + c.totalValue, 0);
  const needingReview = mockClientsExtended.filter((c) => c.riskTolerance === "High").length;
  const today = new Date().toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gold mb-1">Welcome to Meridian</p>
          <h1 className="font-display text-3xl mb-1">Client Management Hub</h1>
          <p className="text-sm text-muted">Monitor clients, track portfolios, and stay ahead with intelligent insights.</p>
        </div>
        <div className="text-right shrink-0 ml-6">
          <p className="text-xs text-muted mb-2">{today}</p>
          <div className="border-l-2 border-gold pl-3 text-xs text-muted leading-snug max-w-[160px]">
            Disciplined Advice Creates Brighter Futures.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <KpiCard
          icon={Coins}
          iconColor="#C9A227"
          label="Total Assets Under Management"
          value={totalAUM >= 1_000_000 ? `$${(totalAUM / 1_000_000).toFixed(2)}M` : `$${totalAUM.toLocaleString()}`}
          trend={2.4}
          sparkData={[9.8, 10.0, 9.9, 10.2, 10.3, 10.4, totalAUM / 1_000_000]}
          sparkColor="#C9A227"
          delay={0}
        />
        <KpiCard
          icon={Users}
          iconColor="#C1614A"
          label="Clients Needing Review"
          value={needingReview}
          trend={needingReview > 0 ? 100 : 0}
          sparkData={[2, 3, 2, 4, 3, 3, needingReview]}
          sparkColor="#C1614A"
          delay={0.05}
        />
        <KpiCard
          icon={Scale}
          iconColor="#4FA88F"
          label="Recent Rebalancing Actions"
          value={12}
          trend={33}
          sparkData={[4, 6, 5, 8, 7, 9, 12]}
          sparkColor="#4FA88F"
          delay={0.1}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">Select a client to begin</p>
          <p className="text-xs text-muted">View client details, portfolio performance, and recommended actions.</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted mr-1">Risk filter:</span>
          {["All", "Low", "Moderate", "High"].map((tier) => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`relative text-xs px-3 py-1 rounded-full transition-colors ${
                riskFilter === tier ? "text-gold" : "text-muted hover:text-ink"
              }`}
            >
              {riskFilter === tier && (
                <motion.div
                  layoutId="filterPill"
                  className="absolute inset-0 rounded-full bg-gold/10 border border-gold/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tier}</span>
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search clients by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm mb-5 px-3 py-2 text-sm bg-white/[0.03] border border-hairline rounded-lg placeholder:text-muted/60 focus:outline-none focus:border-gold/40 transition-colors"
      />

      {filteredClients.length === 0 && (
        <p className="text-sm text-muted">No clients match your search.</p>
      )}

      <div className="grid grid-cols-4 gap-4">
        {filteredClients.map((client, i) => (
          <ClientCard
            key={client.id}
            client={client}
            breached={mockTracesById[client.id]?.agents.driftDetection.breached}
            onSelect={onSelect}
            delay={i * 0.06}
          />
        ))}
      </div>
    </div>
  );
}