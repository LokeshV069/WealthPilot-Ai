import { useState } from "react";
import { Plus, Trash2, Send, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const WEBHOOK_URL = "https://api.agents.snsihub.ai/webhook/11f802de-a6a1-4886-aee3-29f1a6d7e4d0"; // your real production URL

const GOAL_OPTIONS = ["retirement", "child_education", "home_purchase", "travel", "other"];
const LIQUIDITY_OPTIONS = ["low", "medium", "high"];
const RISK_OPTIONS = ["conservative", "moderate", "aggressive"];
const EVENT_TYPES = ["marriage", "inheritance", "retirement", "job_loss", "job_promotion", "other"];
const ASSET_CLASSES = ["equity", "bonds", "cash", "alternatives"];

export default function DataEntry({ initialClient, onResult }) {
  const [form, setForm] = useState({
    clientId: initialClient?.clientId || "C001",
    name: initialClient?.name || "",
    age: initialClient?.age || 30,
    riskTolerance: initialClient?.riskTolerance || "moderate",
    goals: initialClient?.goals || ["retirement"],
    timeHorizonYears: initialClient?.timeHorizonYears || 10,
    liquidityNeeds: initialClient?.liquidityNeeds || "low",
    targetAllocation: initialClient?.targetAllocation || { equity: 60, bonds: 30, cash: 5, alternatives: 5 },
    lifeEvents: initialClient?.lifeEvents || [],
    holdings: initialClient?.holdings || [],
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | waiting | error
  const [errorMsg, setErrorMsg] = useState("");

  const allocationTotal = Object.values(form.targetAllocation).reduce((a, b) => a + Number(b || 0), 0);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleGoal(goal) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal],
    }));
  }

  function updateAllocation(key, value) {
    setForm((f) => ({ ...f, targetAllocation: { ...f.targetAllocation, [key]: Number(value) } }));
  }

  function addLifeEvent() {
    setForm((f) => ({ ...f, lifeEvents: [...f.lifeEvents, { type: "marriage", date: "", description: "" }] }));
  }
  function updateLifeEvent(i, field, value) {
    setForm((f) => {
      const events = [...f.lifeEvents];
      events[i] = { ...events[i], [field]: value };
      return { ...f, lifeEvents: events };
    });
  }
  function removeLifeEvent(i) {
    setForm((f) => ({ ...f, lifeEvents: f.lifeEvents.filter((_, idx) => idx !== i) }));
  }

  function addHolding() {
    setForm((f) => ({ ...f, holdings: [...f.holdings, { ticker: "", custodian: "", quantity: 0, assetClass: "equity" }] }));
  }
  function updateHolding(i, field, value) {
    setForm((f) => {
      const holdings = [...f.holdings];
      holdings[i] = { ...holdings[i], [field]: field === "quantity" ? Number(value) : value };
      return { ...f, holdings };
    });
  }
  function removeHolding(i) {
    setForm((f) => ({ ...f, holdings: f.holdings.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.status === "waiting" || data.success === false) {
        setStatus("waiting");
        return;
      }
      if (data.agents) {
        setStatus("success");
        onResult?.(data);
        return;
      }
      setStatus("error");
      setErrorMsg("Unexpected response shape from the pipeline.");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message === "Failed to fetch" ? "Could not reach the webhook — check the URL, or this may be a CORS restriction." : err.message);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl">
      <p className="text-xs uppercase tracking-wide text-muted mb-1">Live Data Submission</p>
      <h1 className="font-display text-2xl mb-6">Update My Financial Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-premium p-6">
          <p className="font-medium text-sm mb-4">Profile</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Age</label>
              <input type="number" value={form.age} onChange={(e) => updateField("age", Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Risk Tolerance</label>
              <select value={form.riskTolerance} onChange={(e) => updateField("riskTolerance", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50">
                {RISK_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Liquidity Needs</label>
              <select value={form.liquidityNeeds} onChange={(e) => updateField("liquidityNeeds", e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50">
                {LIQUIDITY_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted mb-1 block">Time Horizon (years)</label>
            <input type="number" value={form.timeHorizonYears} onChange={(e) => updateField("timeHorizonYears", Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="text-xs text-muted mb-2 block">Goals</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.goals.includes(g) ? "border-gold bg-gold/10 text-ink" : "border-hairline text-muted hover:text-ink"
                  }`}
                >
                  {g.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm">Target Allocation</p>
            <span className={`text-xs font-mono ${allocationTotal === 100 ? "text-teal" : "text-rust"}`}>{allocationTotal}% total</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {ASSET_CLASSES.map((a) => (
              <div key={a}>
                <label className="text-xs text-muted mb-1 block capitalize">{a}</label>
                <input type="number" value={form.targetAllocation[a]} onChange={(e) => updateAllocation(a, e.target.value)} className="w-full px-2 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-gold/50" />
              </div>
            ))}
          </div>
          {allocationTotal !== 100 && <p className="text-xs text-rust mt-2">Allocation should sum to 100%.</p>}
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm">Life Events</p>
            <button type="button" onClick={addLifeEvent} className="flex items-center gap-1 text-xs text-gold hover:underline">
              <Plus size={13} /> Add Event
            </button>
          </div>
          {form.lifeEvents.length === 0 && <p className="text-xs text-muted">No life events added.</p>}
          {form.lifeEvents.map((event, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-center">
              <select value={event.type} onChange={(e) => updateLifeEvent(i, "type", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg">
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="date" value={event.date} onChange={(e) => updateLifeEvent(i, "date", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg" />
              <input placeholder="Description" value={event.description} onChange={(e) => updateLifeEvent(i, "description", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg" />
              <button type="button" onClick={() => removeLifeEvent(i)} className="text-muted hover:text-rust transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium text-sm">Holdings</p>
            <button type="button" onClick={addHolding} className="flex items-center gap-1 text-xs text-gold hover:underline">
              <Plus size={13} /> Add Holding
            </button>
          </div>
          {form.holdings.length === 0 && <p className="text-xs text-muted">No holdings added.</p>}
          {form.holdings.map((h, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 mb-2 items-center">
              <input placeholder="Ticker" value={h.ticker} onChange={(e) => updateHolding(i, "ticker", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg" />
              <input placeholder="Custodian" value={h.custodian} onChange={(e) => updateHolding(i, "custodian", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg" />
              <input type="number" placeholder="Qty" value={h.quantity} onChange={(e) => updateHolding(i, "quantity", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg" />
              <select value={h.assetClass} onChange={(e) => updateHolding(i, "assetClass", e.target.value)} className="px-2 py-2 text-xs bg-white border border-hairline rounded-lg">
                {ASSET_CLASSES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <button type="button" onClick={() => removeHolding(i)} className="text-muted hover:text-rust transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold/90 hover:bg-gold text-white font-medium transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {status === "submitting" ? "Running agents..." : "Submit & Run Agents"}
        </button>

        {status === "waiting" && (
          <div className="flex items-center gap-2 text-sm text-gold">
            <Loader2 size={14} className="animate-spin" /> Still processing — the pipeline can take up to a minute. Try submitting again shortly.
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-rust">
            <AlertTriangle size={14} /> {errorMsg}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-teal">
            <CheckCircle2 size={14} /> Success — dashboard updated with live results.
          </div>
        )}
      </form>
    </div>
  );
}