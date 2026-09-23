import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, RefreshCcw, FileText, Loader2, Download, Calendar, Mail, CheckCircle2, X } from "lucide-react";
import RiskRing from "./RiskRing";
import { RISK_STYLES, initials } from "../utils/clientDisplay";
import trustPhoto from "../assets/trust-photo.jpg";
import { useToast } from "../context/ToastContext";

export default function ClientProfileHeader({ client, onRebalance, holdings }) {
  const style = RISK_STYLES[client.riskTolerance];
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState("2026-09-25");
  const [meetingTime, setMeetingTime] = useState("14:00");
  const [meetingNotes, setMeetingNotes] = useState("Quarterly portfolio rebalancing & tax planning review.");

  function handleGenerateReport() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const reportText = `=====================================================
MERIDIAN WEALTH CONSOLE - CLIENT PORTFOLIO SUMMARY
Generated on: ${new Date().toLocaleString()}
=====================================================
Client Name:      ${client.name} (ID: ${client.id})
Status:           ${client.status || "Active"}
Risk Profile:     ${client.riskTolerance} (Score: ${client.riskScore}/10)
Active Strategy:  ${client.activePlan}
Next Milestone:   ${client.nextMilestone}
Total Portfolio:  $${client.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}

GOALS & PROGRESS:
${(client.goals || []).map((g) => `- ${g.label}: ${g.progress}% completed`).join("\n")}

HOLDINGS SUMMARY:
${(holdings || []).map((h) => `- ${h.ticker} (${h.assetClass}): ${h.quantity} shares @ $${h.price} via ${h.custodian}`).join("\n")}

COMPLIANCE & AUDIT:
- Suitability: Certified suitable under fiduciary mandate
- Custodians: Zerodha, Groww verified
=====================================================`;

      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${client.name.replace(/\s+/g, "_")}_Portfolio_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Report downloaded for ${client.name}.`, "success");
    }, 1200);
  }

  function handleExportCsv() {
    setShowMenu(false);
    const headers = "Ticker,AssetClass,Custodian,Quantity,Price,MarketValue\n";
    const rows = (holdings || [])
      .map((h) => `${h.ticker},${h.assetClass},${h.custodian},${h.quantity},${h.price},${(h.quantity * h.price).toFixed(2)}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${client.name.replace(/\s+/g, "_")}_Holdings.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Holdings CSV exported for ${client.name}.`, "success");
  }

  function handleEmailSummary() {
    setShowMenu(false);
    showToast(`Portfolio summary emailed to ${client.email}.`, "success");
  }

  function handleConfirmRebalance() {
    setShowRebalanceModal(false);
    onRebalance?.(client.id);
    showToast(`Rebalancing complete for ${client.name}. Targets restored.`, "success");
  }

  function handleScheduleMeeting(e) {
    e.preventDefault();
    setShowMeetingModal(false);
    showToast(`Review meeting with ${client.name} booked for ${meetingDate} at ${meetingTime}.`, "success");
  }

  return (
    <>
      <div className="shrink-0 relative border-b border-hairline px-8 py-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-[0.06]"
          style={{ backgroundImage: `url(${trustPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium shrink-0"
              style={{ backgroundColor: `${client.accentColor}20`, color: client.accentColor }}
            >
              <RiskRing score={client.riskScore} size={64} strokeColor={client.accentColor} />
              <span className="relative z-10">{initials(client.name)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display text-xl">{client.name}</p>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-teal/10 text-teal">
                  {client.status || "Active"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className={style.badge}>{client.riskTolerance} risk</span>
                <span>·</span>
                <span>{client.activePlan}</span>
                <span>·</span>
                <span>Next: {client.nextMilestone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-hairline hover:border-gold/40 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin text-gold" /> : <FileText size={13} strokeWidth={1.75} />}
              {isGenerating ? "Generating..." : "Generate Report"}
            </button>

            <button
              onClick={() => setShowRebalanceModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gold/90 hover:bg-gold text-bg font-medium transition-colors"
            >
              <RefreshCcw size={13} strokeWidth={1.75} />
              Rebalance Portfolio
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-8 h-8 rounded-lg border border-hairline flex items-center justify-center text-muted hover:text-ink hover:border-gold/40 transition-colors"
              >
                <MoreHorizontal size={15} strokeWidth={1.75} />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-10 w-52 bg-surface border border-hairline rounded-xl shadow-xl py-1.5 z-30 overflow-hidden"
                >
                  <button
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-ink hover:bg-gold/10 transition-colors"
                  >
                    <Download size={13} className="text-gold" /> Export Holdings (CSV)
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowMeetingModal(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-ink hover:bg-gold/10 transition-colors"
                  >
                    <Calendar size={13} className="text-teal" /> Schedule Review Meeting
                  </button>
                  <button
                    onClick={handleEmailSummary}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-ink hover:bg-gold/10 transition-colors"
                  >
                    <Mail size={13} className="text-slate" /> Email Client Summary
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REBALANCE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showRebalanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-surface border border-hairline rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowRebalanceModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center mb-3">
                <RefreshCcw size={18} className="text-gold" />
              </div>
              <h3 className="font-display text-lg mb-1">Execute Portfolio Rebalance</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                This will trigger trade orders to realign <strong>{client.name}</strong>'s portfolio back to their target asset allocation ({client.activePlan}).
              </p>
              <div className="p-3 bg-black/[0.03] rounded-xl border border-hairline text-xs space-y-1.5 mb-5">
                <div className="flex justify-between">
                  <span className="text-muted">Target Asset Allocation</span>
                  <span className="font-mono text-ink">Balanced Strategy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Compliance Suitability</span>
                  <span className="text-teal font-medium flex items-center gap-1"><CheckCircle2 size={11} /> Approved</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRebalanceModal(false)}
                  className="flex-1 py-2 text-xs rounded-lg border border-hairline hover:bg-black/[0.03] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRebalance}
                  className="flex-1 py-2 text-xs rounded-lg bg-gold hover:bg-gold/90 text-bg font-medium transition-colors"
                >
                  Confirm & Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE REVIEW MEETING MODAL */}
      <AnimatePresence>
        {showMeetingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-surface border border-hairline rounded-2xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowMeetingModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-10 h-10 rounded-full bg-teal/15 flex items-center justify-center mb-3">
                <Calendar size={18} className="text-teal" />
              </div>
              <h3 className="font-display text-lg mb-1">Schedule Review Meeting</h3>
              <p className="text-xs text-muted mb-4">Book a consultation session with <strong>{client.name}</strong>.</p>
              <form onSubmit={handleScheduleMeeting} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted mb-1 block">Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-black/[0.02] border border-hairline rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted mb-1 block">Time</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-black/[0.02] border border-hairline rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted mb-1 block">Agenda Notes</label>
                  <textarea
                    rows={2}
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-black/[0.02] border border-hairline rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="flex-1 py-2 text-xs rounded-lg border border-hairline hover:bg-black/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs rounded-lg bg-teal text-white font-medium hover:bg-teal/90 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}