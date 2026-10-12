import { useLocation, Link } from "react-router-dom";
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
        <button onClick={onHome} className="hover:text-ink transition-colors cursor-pointer">Dashboard</button>
      ) : (
        <Link to="/" title="Back to Meridian Home" className="hover:text-ink transition-colors cursor-pointer">Meridian</Link>
      )}
      <ChevronRight size={11} />
      <span>{client?.name || "Client"}</span>
      <ChevronRight size={11} />
      <span className="text-ink font-medium">{pageLabel}</span>
    </div>
  );
}