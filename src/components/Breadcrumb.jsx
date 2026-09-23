import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const PAGE_LABELS = {
  "/overview": "Overview",
  "/portfolio": "Portfolio",
  "/trace": "Agent Trace",
  "/compliance": "Compliance",
  "/update": "My Profile",
};

export default function Breadcrumb({ isManager, client, onHome }) {
  const location = useLocation();
  const pageLabel = PAGE_LABELS[location.pathname] || "Overview";

  return (
    <div className="shrink-0 px-8 py-2.5 border-b border-hairline flex items-center gap-1.5 text-xs text-muted">
      {isManager ? (
        <button onClick={onHome} className="hover:text-ink transition-colors">Dashboard</button>
      ) : (
        <span>Meridian</span>
      )}
      <ChevronRight size={11} />
      <span>{client?.name}</span>
      <ChevronRight size={11} />
      <span className="text-ink font-medium">{pageLabel}</span>
    </div>
  );
}