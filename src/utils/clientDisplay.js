const DEFAULT_STYLE = { badge: "text-gold", avatar: "bg-gold/20 text-gold", spark: "#C9A227" };

export const RISK_STYLES = {
  Low: { badge: "text-teal", avatar: "bg-teal/20 text-teal", spark: "#4FA88F" },
  low: { badge: "text-teal", avatar: "bg-teal/20 text-teal", spark: "#4FA88F" },
  conservative: { badge: "text-teal", avatar: "bg-teal/20 text-teal", spark: "#4FA88F" },
  Conservative: { badge: "text-teal", avatar: "bg-teal/20 text-teal", spark: "#4FA88F" },

  Moderate: { badge: "text-gold", avatar: "bg-gold/20 text-gold", spark: "#C9A227" },
  moderate: { badge: "text-gold", avatar: "bg-gold/20 text-gold", spark: "#C9A227" },

  High: { badge: "text-rust", avatar: "bg-rust/20 text-rust", spark: "#C1614A" },
  high: { badge: "text-rust", avatar: "bg-rust/20 text-rust", spark: "#C1614A" },
  aggressive: { badge: "text-rust", avatar: "bg-rust/20 text-rust", spark: "#C1614A" },
  Aggressive: { badge: "text-rust", avatar: "bg-rust/20 text-rust", spark: "#C1614A" },
};

export function getRiskStyle(tolerance) {
  if (!tolerance) return DEFAULT_STYLE;
  return RISK_STYLES[tolerance] || RISK_STYLES[String(tolerance).toLowerCase()] || DEFAULT_STYLE;
}

export function initials(name) {
  if (!name || typeof name !== "string") return "CL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}