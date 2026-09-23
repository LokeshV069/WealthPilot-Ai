import { TrendingUp, Landmark, Wallet, Layers } from "lucide-react";

export const ASSET_META = {
  equity: { label: "Equity", icon: TrendingUp, color: "var(--color-gold)" },
  bonds: { label: "Bonds", icon: Landmark, color: "var(--color-teal)" },
  cash: { label: "Cash", icon: Wallet, color: "var(--color-slate)" },
  alternatives: { label: "Alternatives", icon: Layers, color: "var(--color-plum)" },
};