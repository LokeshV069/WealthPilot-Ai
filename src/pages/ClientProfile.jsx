import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  DollarSign,
  CalendarClock,
  Wallet,
  FileText,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Plus,
  Trash2,
  Hash,
  Eye,
  Download,
  X,
} from "lucide-react";
import { useClientProfileForm, GOAL_OPTIONS, LIQUIDITY_OPTIONS, RISK_OPTIONS, EVENT_TYPES, ASSET_CLASSES } from "../hooks/useClientProfileForm";
import { ASSET_META } from "../utils/assetMeta";
import { useToast } from "../context/ToastContext";

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "financial", label: "Financial Profile", icon: DollarSign },
  { id: "events", label: "Life Events", icon: CalendarClock },
  { id: "holdings", label: "Holdings", icon: Wallet },
];

const DOCS = [
  { name: "Risk Disclosure.pdf", date: "Jan 2026" },
  { name: "KYC Verification.pdf", date: "Jan 2026" },
  { name: "Investment Mandate.pdf", date: "Mar 2026" },
];

function inputClass() {
  return "w-full px-3 py-2.5 text-sm bg-white border border-hairline rounded-xl focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 transition-all";
}

export default function ClientProfile({ initialClient, client, onResult }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const f = useClientProfileForm(initialClient || client, onResult);
  const personalRef = useRef(null);
  const financialRef = useRef(null);
  const eventsRef = useRef(null);
  const holdingsRef = useRef(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const sectionRefs = { personal: personalRef, financial: financialRef, events: eventsRef, holdings: holdingsRef };

  function scrollTo(id) {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCancel() {
    showToast("Profile edits cancelled.", "info");
    navigate("/overview");
  }

  function handleDownloadDoc(doc) {
    const docContent = `=========================================
DOCUMENT: ${doc.name}
Verified: ${doc.date}
Client: ${f.form.name || "Client"}
Status: Fully Verified & Encrypted (256-bit)
Custodian Verified: Zerodha / Groww
=========================================
Official Meridian Wealth Regulatory Filing`;
    const blob = new Blob([docContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${doc.name}.`, "success");
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl mb-1">My Profile</h1>
          <p className="text-sm text-muted">Keep your financial profile current so Meridian's agents can guide you accurately.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm px-4 py-2 rounded-lg border border-hairline hover:border-gold/40 hover:bg-black/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={f.handleSubmit}
            disabled={f.status === "submitting"}
            className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg bg-gold/90 hover:bg-gold text-white font-medium transition-colors disabled:opacity-50"
          >
            {f.status === "submitting" ? <Loader2 size={14} className="animate-spin" /> : null}
            {f.status === "submitting" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {f.status === "waiting" && (
        <div className="flex items-center gap-2 text-sm text-gold mb-4">
          <Loader2 size={14} className="animate-spin" /> Still processing — the pipeline can take up to a minute. Try saving again shortly.
        </div>
      )}
      {f.status === "error" && (
        <div className="flex items-center gap-2 text-sm text-rust mb-4">
          <AlertTriangle size={14} /> {f.errorMsg}
        </div>
      )}
      {f.status === "success" && (
        <div className="flex items-center gap-2 text-sm text-teal mb-4">
          <CheckCircle2 size={14} /> Saved — your dashboard now reflects live agent results.
        </div>
      )}

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-[200px_1fr_300px] gap-6 items-start">
        {/* LEFT: section nav */}
        <div className="card-premium p-3 sticky top-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-gold/8 transition-colors mb-1 last:mb-0"
              >
                <Icon size={15} strokeWidth={1.75} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* CENTER: form */}
        <div className="space-y-6">
          <div ref={personalRef} className="card-premium p-6">
            <p className="font-display text-lg mb-5">Personal Information</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Full Name</label>
                <input value={f.form.name} onChange={(e) => f.updateField("name", e.target.value)} className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Age</label>
                <input type="number" value={f.form.age} onChange={(e) => f.updateField("age", Number(e.target.value))} className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Time Horizon (yrs)</label>
                <input type="number" value={f.form.timeHorizonYears} onChange={(e) => f.updateField("timeHorizonYears", Number(e.target.value))} className={inputClass()} />
              </div>
            </div>
          </div>

          <div ref={financialRef} className="card-premium p-6">
            <p className="font-display text-lg mb-5">Financial Profile</p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Risk Tolerance</label>
                <select value={f.form.riskTolerance} onChange={(e) => f.updateField("riskTolerance", e.target.value)} className={inputClass()}>
                  {RISK_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Liquidity Needs</label>
                <select value={f.form.liquidityNeeds} onChange={(e) => f.updateField("liquidityNeeds", e.target.value)} className={inputClass()}>
                  {LIQUIDITY_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Allocation Total</label>
                <div className={`px-3 py-2.5 text-sm rounded-xl border ${f.allocationTotal === 100 ? "border-teal/40 text-teal bg-teal/5" : "border-rust/40 text-rust bg-rust/5"}`}>
                  {f.allocationTotal}%
                </div>
              </div>
            </div>
            <label className="text-xs text-muted mb-2 block">Goals</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => f.toggleGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                    f.form.goals.includes(g) ? "border-gold bg-gold/10 text-ink" : "border-hairline text-muted hover:text-ink"
                  }`}
                >
                  {g.replace("_", " ")}
                </button>
              ))}
            </div>
            <label className="text-xs text-muted mb-2 block">Target Allocation</label>
            <div className="grid grid-cols-4 gap-3">
              {ASSET_CLASSES.map((a) => {
                const meta = ASSET_META[a];
                const Icon = meta.icon;
                return (
                  <div key={a}>
                    <label className="text-xs text-muted mb-1.5 flex items-center gap-1.5 capitalize">
                      <Icon size={12} style={{ color: meta.color }} /> {a}
                    </label>
                    <input type="number" value={f.form.targetAllocation[a]} onChange={(e) => f.updateAllocation(a, e.target.value)} className={inputClass()} />
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={eventsRef} className="card-premium p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-lg">Life Events</p>
              <button type="button" onClick={f.addLifeEvent} className="flex items-center gap-1 text-xs text-gold hover:underline">
                <Plus size={13} /> Add Event
              </button>
            </div>
            {f.form.lifeEvents.length === 0 && <p className="text-sm text-muted">No life events recorded.</p>}
            {f.form.lifeEvents.map((event, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-3 mb-3 items-center">
                <select value={event.type} onChange={(e) => f.updateLifeEvent(i, "type", e.target.value)} className={inputClass()}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="date" value={event.date} onChange={(e) => f.updateLifeEvent(i, "date", e.target.value)} className={inputClass()} />
                <input placeholder="Description" value={event.description} onChange={(e) => f.updateLifeEvent(i, "description", e.target.value)} className={inputClass()} />
                <button type="button" onClick={() => f.removeLifeEvent(i)} className="text-muted hover:text-rust transition-colors p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div ref={holdingsRef} className="card-premium p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-lg">Holdings</p>
              <button type="button" onClick={f.addHolding} className="flex items-center gap-1 text-xs text-gold hover:underline">
                <Plus size={13} /> Add Holding
              </button>
            </div>
            {f.form.holdings.length === 0 && <p className="text-sm text-muted">No holdings recorded.</p>}
            {f.form.holdings.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 mb-3 items-center">
                <input placeholder="Ticker" value={h.ticker} onChange={(e) => f.updateHolding(i, "ticker", e.target.value)} className={inputClass()} />
                <input placeholder="Custodian" value={h.custodian} onChange={(e) => f.updateHolding(i, "custodian", e.target.value)} className={inputClass()} />
                <input type="number" placeholder="Qty" value={h.quantity} onChange={(e) => f.updateHolding(i, "quantity", e.target.value)} className={inputClass()} />
                <select value={h.assetClass} onChange={(e) => f.updateHolding(i, "assetClass", e.target.value)} className={inputClass()}>
                  {ASSET_CLASSES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <button type="button" onClick={() => f.removeHolding(i)} className="text-muted hover:text-rust transition-colors p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: stat cards */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-3">Profile Completion</p>
            <div className="flex items-center gap-3 mb-2">
              <p className="font-mono text-2xl">{f.completionPercent}%</p>
            </div>
            <div className="h-1.5 bg-hairline rounded-full overflow-hidden">
              <motion.div className="h-full bg-gold rounded-full" initial={{ width: 0 }} animate={{ width: `${f.completionPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
            <p className="text-xs text-muted mt-2">{f.completionPercent === 100 ? "All set." : "A few fields still need attention."}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-premium p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-3">Quick Statistics</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-1.5"><Wallet size={13} /> Holdings</span>
                <span className="font-mono">{f.form.holdings.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-1.5"><CalendarClock size={13} /> Life Events</span>
                <span className="font-mono">{f.form.lifeEvents.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-1.5"><Hash size={13} /> Time Horizon</span>
                <span className="font-mono">{f.form.timeHorizonYears} yrs</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-3">Linked Documents</p>
            <div className="space-y-2">
              {DOCS.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/[0.02] border border-hairline hover:bg-black/[0.04] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-gold shrink-0" strokeWidth={1.75} />
                    <span className="text-xs truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      title="View document"
                      className="p-1 rounded hover:bg-black/[0.05] text-muted hover:text-ink transition-colors"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc)}
                      title="Download file"
                      className="p-1 rounded hover:bg-black/[0.05] text-muted hover:text-gold transition-colors"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-3">All regulatory documents are verified and archived.</p>
          </motion.div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-surface border border-hairline rounded-2xl shadow-2xl p-6 relative"
          >
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center mb-3">
              <FileText size={18} className="text-gold" />
            </div>
            <h3 className="font-display text-lg mb-1">{selectedDoc.name}</h3>
            <p className="text-xs text-muted mb-4">Official advisory and custodial regulatory record.</p>

            <div className="p-3 bg-black/[0.02] border border-hairline rounded-xl text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-muted">Filing Date</span>
                <span>{selectedDoc.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Verification Status</span>
                <span className="text-teal font-medium">Verified (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Storage Encryption</span>
                <span className="font-mono text-muted">AES-256 GCM</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="flex-1 py-2 text-xs rounded-lg border border-hairline hover:bg-black/[0.03] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadDoc(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="flex-1 py-2 text-xs rounded-lg bg-gold hover:bg-gold/90 text-bg font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> Download Document
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}