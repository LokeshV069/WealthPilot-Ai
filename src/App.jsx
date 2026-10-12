import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  Activity,
  ShieldCheck,
  ArrowLeft,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Home,
  FilePenLine,
  Users,
  Mail,
  UserCircle,
} from "lucide-react";
import Overview from "./pages/Overview";
import Portfolio from "./pages/Portfolio";
import AgentTrace from "./pages/AgentTrace";
import Compliance from "./pages/Compliance";
import ManagerDashboard from "./components/ManagerDashboard";
import ClientProfileHeader from "./components/ClientProfileHeader";
import RiskRing from "./components/RiskRing";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import { initials } from "./utils/clientDisplay";
import { mockClientsExtended } from "./data/mockTrace";
import { generateClientTrace } from "./utils/traceGenerator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import heroPhoto from "./assets/hero-photo.jpg";
import meridianLogo from "./assets/meridian-logo.png";
import ClientProfile from "./pages/ClientProfile";
import Breadcrumb from "./components/Breadcrumb";
import { ToastProvider } from "./context/ToastContext";

const NAV_ITEMS = [
  { label: "Overview", path: "/overview", icon: LayoutDashboard },
  { label: "Portfolio", path: "/portfolio", icon: Wallet },
  { label: "Agent Trace", path: "/trace", icon: Activity },
  { label: "Compliance", path: "/compliance", icon: ShieldCheck },
  { label: "My Profile", path: "/update", icon: FilePenLine },
];

function Sidebar({ mode, isManager, onTabChange, activeManagerTab = "dashboard" }) {
  const { logout } = useAuth();
  const navItems = isManager ? NAV_ITEMS.filter((item) => item.path !== "/update") : NAV_ITEMS;

  const MANAGER_LINKS = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "clients", label: "Clients", icon: Users },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "profile", label: "My Profile", icon: UserCircle },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-hairline bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="px-5 py-5 border-b border-hairline flex items-center justify-center">
          <img
            src={meridianLogo}
            alt="Meridian Wealth Console"
            className="h-10 w-auto object-contain mix-blend-multiply"
          />
        </div>
        <nav className="px-3 py-4 space-y-1">
          {mode === "manager-home" ? (
            MANAGER_LINKS.map(({ id, label, icon: Icon }) => {
              const active = activeManagerTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange?.(id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                    active
                      ? "text-ink bg-gold/15 border border-gold/30 shadow-sm"
                      : "text-muted hover:text-ink hover:bg-black/[0.03]"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} className={active ? "text-gold" : "text-muted"} />
                  {label}
                </button>
              );
            })
          ) : (
            navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "text-ink bg-gold/10 border border-gold/25" : "text-muted hover:text-ink hover:bg-black/[0.03]"
                  }`
                }
              >
                <Icon size={15} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))
          )}
        </nav>
      </div>

      <div className="p-4">
        <div
          className="rounded-2xl overflow-hidden p-4 h-36 relative flex flex-col justify-end shadow-sm"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15,15,18,0.92) 0%, rgba(15,15,18,0.4) 60%, transparent 100%), url(${heroPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="text-xs text-white font-medium leading-tight mb-2 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            A brighter<br />tomorrow for<br />generations.
          </p>
          <div className="w-6 h-0.5 bg-gold" />
        </div>
        {mode === "client-detail" && (
          <button onClick={logout} className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-rust hover:bg-black/[0.03] transition-colors">
            <LogOut size={13} strokeWidth={1.75} />
            Log out
          </button>
        )}
      </div>
    </aside>
  );
}

function TopBar({ selectedClient, onBack, isManager, onSearch, searchValue = "" }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Drift threshold breached", desc: "Ananya Rao's bonds +8.6% above target", time: "10m ago", type: "alert" },
    { id: 2, title: "Compliance Approved", desc: "Trade suitability verified for Q3 review", time: "1h ago", type: "success" },
    { id: 3, title: "Tax Planning Review", desc: "Arun Iyer milestone scheduled this week", time: "1d ago", type: "info" },
  ]);

  function clearNotifications() {
    setNotifications([]);
    setNotifOpen(false);
  }

  return (
    <header className="h-16 shrink-0 border-b border-hairline flex items-center justify-between gap-4 px-6 relative z-30 bg-surface/80 backdrop-blur-sm">
      {selectedClient ? (
        <>
          <div className="flex items-center gap-2 shrink-0 min-w-[160px]">
            {isManager && (
              <button onClick={onBack} title="Back to Dashboard" className="text-muted hover:text-ink transition-colors p-1 -ml-1 rounded-md hover:bg-black/[0.04]">
                <ArrowLeft size={15} strokeWidth={1.75} />
              </button>
            )}
            <motion.div
              layoutId={`avatar-${selectedClient?.id || "default"}`}
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: `${selectedClient?.accentColor || "#C9A227"}26`, color: selectedClient?.accentColor || "#C9A227" }}
            >
              <RiskRing score={selectedClient?.riskScore || 7} size={32} strokeColor={selectedClient?.accentColor || "#C9A227"} />
              <span className="relative z-10">{initials(selectedClient?.name)}</span>
            </motion.div>
            <motion.div layoutId={`name-${selectedClient?.id || "default"}`}>
              <p className="text-sm font-medium leading-tight">{selectedClient?.name || "Client"}</p>
            </motion.div>
          </div>
          <div className="flex-1 max-w-xs ml-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-hairline bg-black/[0.02] text-ink text-sm focus-within:border-gold/50 transition-colors">
              <Search size={14} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search this client..."
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full bg-transparent focus:outline-none placeholder:text-muted/60 text-xs"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-hairline bg-black/[0.02] text-ink text-sm focus-within:border-gold/50 focus-within:bg-white transition-all">
            <Search size={15} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search clients, portfolios, or insights..."
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-transparent focus:outline-none placeholder:text-muted/60 text-xs text-ink"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 ml-auto shrink-0 relative">
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
            className="relative p-1.5 text-muted hover:text-ink transition-colors rounded-lg hover:bg-black/[0.03]"
          >
            <Bell size={17} strokeWidth={1.75} />
            {notifications.length > 0 && (
              <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-rust animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-11 w-80 bg-surface border border-hairline rounded-xl shadow-2xl p-4 z-40"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                <p className="text-xs font-medium uppercase tracking-wide">Notifications ({notifications.length})</p>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-[11px] text-gold hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">No unread notifications.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-black/[0.02] border border-hairline hover:bg-black/[0.04] transition-colors">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-medium text-ink">{n.title}</p>
                        <span className="text-[10px] text-muted">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-muted leading-tight">{n.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <button onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-ink text-bg flex items-center justify-center text-xs font-medium">
            {initials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium leading-tight">{user?.name || "User"}</p>
          </div>
          <ChevronDown size={13} className="text-muted" />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-12 w-40 border border-hairline bg-surface rounded-lg shadow-lg overflow-hidden z-20"
          >
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-rust hover:bg-black/[0.03] transition-colors">
              <LogOut size={14} strokeWidth={1.75} />
              Log out
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}

function AnimatedRoutes({ trace, holdings, client, onLiveResult, onClientUpdate, onAddHolding, onDeleteHolding }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-0"
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview trace={trace} client={client} />} />
          <Route
            path="/portfolio"
            element={<Portfolio holdings={holdings} onAddHolding={onAddHolding} onDeleteHolding={onDeleteHolding} />}
          />
          <Route path="/trace" element={<AgentTrace trace={trace} />} />
          <Route path="/compliance" element={<Compliance trace={trace} />} />
          <Route
            path="/update"
            element={
              <ClientProfile
                initialClient={client || trace?.client}
                onResult={onLiveResult}
                onClientUpdate={onClientUpdate}
              />
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const { user, token, updateUser } = useAuth();
  const isManager = user?.role === "manager";
  const [clientsList, setClientsList] = useState([]);
  const [managerTab, setManagerTab] = useState("dashboard");

  // Initial client state derived strictly from authenticated user
  const [selectedClient, setSelectedClient] = useState(() => {
    if (isManager) return null;
    return {
      id: user?.clientId || "C001",
      clientId: user?.clientId || "C001",
      name: user?.name || "Client",
      email: user?.email || "",
      age: 30,
      riskTolerance: "Moderate",
      riskScore: 7,
      accentColor: "#C9A227",
      totalValue: 0,
      performancePct: 0,
      performance: [0],
      activePlan: "Balanced Growth Strategy",
      nextMilestone: "Initial Portfolio Review",
      status: "Active",
      holdings: [],
      lifeEvents: [],
      targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
      goals: [{ label: "Retirement Fund", progress: 0 }],
    };
  });

  const [liveTraces, setLiveTraces] = useState({});

  // 1. Fetch real client profile or manager client list from the database
  useEffect(() => {
    async function loadBackendData() {
      if (!token) return;
      try {
        if (isManager) {
          const res = await fetch("/api/clients", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              const formatted = data.data.map((c) => ({
                ...c,
                id: c.clientId || c._id,
              }));
              setClientsList(formatted);
            }
          }
        } else {
          const res = await fetch("/api/clients/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              const c = data.data;
              setSelectedClient({
                ...c,
                id: c.clientId || c._id,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not load backend data, using local state:", err);
      }
    }

    loadBackendData();
  }, [isManager, token, user?.clientId]);

  // Dynamic trace and holdings directly from selectedClient
  const trace = selectedClient
    ? liveTraces[selectedClient.id] || selectedClient.latestTrace || generateClientTrace(selectedClient)
    : null;
  const holdings = selectedClient ? (selectedClient.holdings || []) : [];

  function handleLiveResult(data) {
    if (selectedClient) {
      setLiveTraces((prev) => ({ ...prev, [selectedClient.id]: data }));
    }
  }

  // Handle client profile updates (name, age, risk tolerance, targets)
  function handleClientUpdate(updatedData) {
    const updated = {
      ...selectedClient,
      ...updatedData,
      id: updatedData.clientId || updatedData.id || selectedClient?.id,
    };
    setSelectedClient(updated);

    // If client edited their name, synchronize user session across all headers immediately
    if (updatedData.name && updatedData.name !== user?.name) {
      updateUser?.({ name: updatedData.name });
    }

    if (isManager) {
      setClientsList((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
    }
  }

  // Add stock holding: persists to backend database
  async function handleAddHolding(newHolding) {
    if (!selectedClient) return;
    const clientId = selectedClient.clientId || selectedClient.id;

    // Optimistic update
    const updatedHoldings = [...(selectedClient.holdings || []), newHolding];
    const updatedTotal = updatedHoldings.reduce(
      (sum, h) => sum + (Number(h.quantity) || 0) * (Number(h.price) || 0),
      0
    );
    const updatedClient = {
      ...selectedClient,
      holdings: updatedHoldings,
      totalValue: Math.round(updatedTotal * 100) / 100,
      performance: [updatedTotal],
    };
    setSelectedClient(updatedClient);

    try {
      if (token) {
        const res = await fetch(`/api/clients/${clientId}/holdings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newHolding),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            const serverClient = { ...resData.data, id: resData.data.clientId || resData.data._id };
            setSelectedClient(serverClient);
            if (isManager) {
              setClientsList((prev) => prev.map((c) => (c.id === clientId ? serverClient : c)));
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to persist holding to server:", err);
    }
  }

  // Delete stock holding: persists to backend database
  async function handleDeleteHolding(ticker) {
    if (!selectedClient) return;
    const clientId = selectedClient.clientId || selectedClient.id;

    // Optimistic update
    const updatedHoldings = (selectedClient.holdings || []).filter(
      (h) => h.ticker.toUpperCase() !== ticker.toUpperCase()
    );
    const updatedTotal = updatedHoldings.reduce(
      (sum, h) => sum + (Number(h.quantity) || 0) * (Number(h.price) || 0),
      0
    );
    const updatedClient = {
      ...selectedClient,
      holdings: updatedHoldings,
      totalValue: Math.round(updatedTotal * 100) / 100,
      performance: [updatedTotal],
    };
    setSelectedClient(updatedClient);

    try {
      if (token) {
        const res = await fetch(`/api/clients/${clientId}/holdings/${ticker}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            const serverClient = { ...resData.data, id: resData.data.clientId || resData.data._id };
            setSelectedClient(serverClient);
            if (isManager) {
              setClientsList((prev) => prev.map((c) => (c.id === clientId ? serverClient : c)));
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to delete holding on server:", err);
    }
  }

  function handleRebalance(clientId) {
    const currentTrace = liveTraces[clientId] || selectedClient?.latestTrace || generateClientTrace(selectedClient);
    if (currentTrace) {
      const rebalancedTrace = {
        ...currentTrace,
        agents: {
          ...currentTrace.agents,
          driftDetection: {
            ...currentTrace.agents.driftDetection,
            breached: false,
            drift: { equity: 0, bonds: 0, cash: 0, alternatives: 0 },
          },
          rebalancingRecommendation: {
            trades: [],
            reasoning: "Portfolio rebalancing orders have been processed and reconciled. Current asset weights are aligned with target allocation.",
          },
          compliance: {
            approved: true,
            justification: "Rebalancing transactions executed and verified under suitability mandates.",
            flaggedTrades: [],
          },
        },
      };
      setLiveTraces((prev) => ({ ...prev, [clientId]: rebalancedTrace }));
    }
  }

  function handleAddClient(newClient) {
    setClientsList((prev) => [newClient, ...prev]);
  }

  return (
    <HashRouter>
      <div className={`h-screen flex ${selectedClient ? "client-shell" : ""}`}>
        <Sidebar
          mode={selectedClient ? "client-detail" : "manager-home"}
          isManager={isManager}
          onTabChange={(tab) => {
            setManagerTab(tab);
            if (tab === "dashboard" || tab === "clients") {
              setSelectedClient(null);
            }
          }}
          activeManagerTab={managerTab}
        />
        <LayoutGroup>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TopBar selectedClient={selectedClient} onBack={() => isManager && setSelectedClient(null)} isManager={isManager} />
            {selectedClient && <Breadcrumb isManager={isManager} client={selectedClient} onHome={() => setSelectedClient(null)} />}
            {selectedClient && (
              <ClientProfileHeader
                client={selectedClient}
                onRebalance={handleRebalance}
                holdings={holdings}
              />
            )}
            <AnimatePresence mode="wait">
              {!selectedClient ? (
                 <motion.div
                  key="hub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                >
                  <ManagerDashboard
                    onSelect={setSelectedClient}
                    clients={clientsList}
                    onAddClient={handleAddClient}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="client"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                >
                  <AnimatedRoutes
                    trace={trace}
                    holdings={holdings}
                    client={selectedClient}
                    onLiveResult={handleLiveResult}
                    onClientUpdate={handleClientUpdate}
                    onAddHolding={handleAddHolding}
                    onDeleteHolding={handleDeleteHolding}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>
    </HashRouter>
  );
}

function Root() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (user) return <AppShell />;
  return showLogin ? <Login onBack={() => setShowLogin(false)} /> : <Landing onSignIn={() => setShowLogin(true)} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ToastProvider>
  );
}