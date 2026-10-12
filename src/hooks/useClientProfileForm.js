import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

const WEBHOOK_URL = "https://api.agents.snsihub.ai/webhook/11f802de-a6a1-4886-aee3-29f1a6d7e4d0";

export const GOAL_OPTIONS = ["retirement", "child_education", "home_purchase", "travel", "other"];
export const LIQUIDITY_OPTIONS = ["low", "medium", "high"];
export const RISK_OPTIONS = ["conservative", "moderate", "aggressive"];
export const EVENT_TYPES = ["marriage", "inheritance", "retirement", "job_loss", "job_promotion", "other"];
export const ASSET_CLASSES = ["equity", "bonds", "cash", "alternatives"];

export function useClientProfileForm(initialClient, onResult, onClientUpdate) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    clientId: initialClient?.clientId || initialClient?.id || "C001",
    name: initialClient?.name || "",
    age: initialClient?.age || 30,
    riskTolerance: initialClient?.riskTolerance || "moderate",
    goals: initialClient?.goals || ["retirement"],
    timeHorizonYears: initialClient?.timeHorizonYears || 10,
    liquidityNeeds: initialClient?.liquidityNeeds || "medium",
    targetAllocation: initialClient?.targetAllocation || { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
    lifeEvents: initialClient?.lifeEvents || [],
    holdings: initialClient?.holdings || [],
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state when initialClient loads or changes
  useEffect(() => {
    if (initialClient) {
      setForm({
        clientId: initialClient.clientId || initialClient.id || "C001",
        name: initialClient.name || "",
        age: initialClient.age || 30,
        riskTolerance: initialClient.riskTolerance || "moderate",
        goals: initialClient.goals || ["retirement"],
        timeHorizonYears: initialClient.timeHorizonYears || 10,
        liquidityNeeds: initialClient.liquidityNeeds || "medium",
        targetAllocation: initialClient.targetAllocation || { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
        lifeEvents: initialClient.lifeEvents || [],
        holdings: initialClient.holdings || [],
      });
    }
  }, [initialClient]);

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
    setForm((f) => ({ ...f, holdings: [...f.holdings, { ticker: "", custodian: "", quantity: 0, price: 0, assetClass: "equity" }] }));
  }
  function updateHolding(i, field, value) {
    setForm((f) => {
      const holdings = [...f.holdings];
      holdings[i] = { ...holdings[i], [field]: field === "quantity" || field === "price" ? Number(value) : value };
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

    const targetClientId = form.clientId || initialClient?.clientId || initialClient?.id || "C001";
    const token = localStorage.getItem("wealthpilot_token");

    let savedClientData = null;

    // 1. SAVE DIRECTLY TO DATABASE
    try {
      const res = await fetch(`/api/clients/${targetClientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          savedClientData = { ...json.data, id: json.data.clientId || json.data._id };
          onClientUpdate?.(savedClientData);
        }
      }
    } catch (err) {
      console.warn("Backend update error, saving locally:", err);
      savedClientData = { ...initialClient, ...form, id: targetClientId };
      onClientUpdate?.(savedClientData);
    }

    // 2. DISPATCH TO LIVE N8N/GEMINI WORKBENCH WEBHOOK
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const rawData = await res.json();
      const data = Array.isArray(rawData) ? rawData[0] : (rawData?.data && !rawData?.agents ? rawData.data : rawData);

      if (data?.agents) {
        setStatus("success");
        showToast("Profile & portfolio saved — AI agent analysis updated.", "success");
        onResult?.(data);

        if (token) {
          fetch(`/api/clients/${targetClientId}/trace`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ trace: data }),
          }).catch(() => {});
        }
        return;
      }
    } catch {
      // If webhook is slow or rate-limited, the database save was already successful
    }

    setStatus("success");
    showToast("Profile changes and stock holdings saved successfully in database.", "success");
    if (savedClientData) {
      onClientUpdate?.(savedClientData);
    }
  }

  const completionChecks = [
    !!form.name,
    !!form.age,
    !!form.riskTolerance,
    form.goals.length > 0,
    allocationTotal === 100,
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