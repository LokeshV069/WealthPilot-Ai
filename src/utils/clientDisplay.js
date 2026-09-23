export const RISK_STYLES = {
  Low: { badge: "text-teal", avatar: "bg-teal/20 text-teal", spark: "#4FA88F" },
  Moderate: { badge: "text-gold", avatar: "bg-gold/20 text-gold", spark: "#C9A227" },
  High: { badge: "text-rust", avatar: "bg-rust/20 text-rust", spark: "#C1614A" },
};

export function initials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}