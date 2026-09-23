import { useState } from "react";
import { useToast } from "../context/ToastContext";

const WEBHOOK_URL = "https://api.agents.snsihub.ai/webhook/11f802de-a6a1-4886-aee3-29f1a6d7e4d0";

export const GOAL_OPTIONS = ["retirement", "child_education", "home_purchase", "travel", "other"];
export const LIQUIDITY_OPTIONS = ["low", "medium", "high"];
export const RISK_OPTIONS = ["conservative", "moderate", "aggressive"];
export const EVENT_TYPES = ["marriage", "inheritance", "retirement", "job_loss", "job_promotion", "other"];
export const ASSET_CLASSES = ["equity", "bonds", "cash", "alternatives"];

export function useClientProfileForm(initialClient, onResult) {
  const { showToast } = useToast();
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
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const allocationTotal = Object.values(form.targetAllocation).reduce((a, b) => a + Number(b || 0), 0);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function toggleGoal(goal) {
    setForm((f) => ({ ...f, goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal] }));
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
    e?.preventDefault();
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
        showToast("Still processing — try saving again shortly.", "info");
        return;
      }
      if (data.agents) {
        setStatus("success");
        showToast("Profile saved — dashboard updated with live results.", "success");
        onResult?.(data);
        return;
      }
      setStatus("error");
      setErrorMsg("Unexpected response shape from the pipeline.");
      showToast("Unexpected response from the pipeline.", "error");
    } catch (err) {
      const message = err.message === "Failed to fetch" ? "Could not reach the webhook — check the URL, or this may be a CORS restriction." : err.message;
      setStatus("error");
      setErrorMsg(message);
      showToast(message, "error");
    }
  }

  const completionChecks = [
    !!form.name,
    !!form.age,
    !!form.riskTolerance,
    form.goals.length > 0,
    allocationTotal === 100,
    form.holdings.length > 0,
  ];
  const completionPercent = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  return {
    form, status, errorMsg, allocationTotal, completionPercent,
    updateField, toggleGoal, updateAllocation,
    addLifeEvent, updateLifeEvent, removeLifeEvent,
    addHolding, updateHolding, removeHolding,
    handleSubmit,
  };
}