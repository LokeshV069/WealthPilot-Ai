# Meridian Wealth Agent — SNS Workbench Pipeline Reference

This document details every node in the 6-agent SNS Workbench / n8n workflow pipeline: its type, wiring, prompt templates, and execution logic.

## Pipeline Architecture

```
Webhook Trigger
  └─ Get Client Record
       ├─ Build Profile Prompt ──────────────────► Client Profile Agent ─┐
       ├─ Build Price Requests ─► Fetch Prices Loop ┐                    │
       │                          (LOOP → Alpha Vantage Quote            │
       │                           → Rate Limit Delay → back to loop)    │
       │                          (DONE) ─┐                              │
       ├──────────────────────────────────┴─► Portfolio Aggregation      │
       │                                          └─► Drift Detection ───┤
       └─ Build Life Event Prompt ──► Life Event Agent ───────────────── ┤
                                                                          │
                            Build Rebalancing Prompt ◄────────────────────┘
                                    │ (merges Drift Detection + Life Event Agent + Client Profile Agent)
                                    ▼
                            Rebalancing Agent
                                    │
              Build Compliance Prompt ◄── (merges Rebalancing Agent + Client Profile Agent)
                                    │
                            Compliance Agent
                                    │
                            Assemble Final Trace ◄── (merges Build Rebalancing Prompt + Rebalancing Agent + Compliance Agent)
                                    │
                          (returned by Webhook, "Respond: When Last Node Finishes")
```

- **LLM Engine**: Google Gemini (`gemini-flash-latest`) via REST API
- **Endpoint Pattern**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY`
- **Market Data Feed**: Alpha Vantage `GLOBAL_QUOTE` REST API

---

## 1. Webhook Trigger

- **Type:** Webhook Trigger
- **Method:** POST
- **Respond:** When Last Node Finishes
- **Authentication:** None (recommended: add a shared secret header before public production use)
- **Payload:** Accepts either `{"clientId": "C001"}` or full client object with updated financial inputs.

---

## 2. Get Client Record

- **Type:** Code (JavaScript)
- **Input:** Webhook Trigger

```javascript
const mockClients = {
  "C001": {
    "clientId": "C001",
    "name": "Ananya Rao",
    "age": 34,
    "riskTolerance": "moderate",
    "goals": ["retirement", "child_education"],
    "timeHorizonYears": 20,
    "liquidityNeeds": "low",
    "targetAllocation": { "equity": 60, "bonds": 30, "cash": 5, "alternatives": 5 },
    "lifeEvents": [
      { "type": "marriage", "date": "2026-06-01", "description": "Recently married, filing jointly" }
    ],
    "holdings": [
      { "custodian": "Zerodha", "ticker": "AAPL", "quantity": 50, "assetClass": "equity" },
      { "custodian": "Groww", "ticker": "MSFT", "quantity": 30, "assetClass": "equity" },
      { "custodian": "Zerodha", "ticker": "BONDFUND", "quantity": 200, "assetClass": "bonds" }
    ]
  }
};

const raw = $input.first().json;
const body = raw.body || raw;

// If request carries full client data from website form, use it directly.
// Otherwise fallback to mockClients by clientId.
const client = body.holdings ? body : (mockClients[body.clientId] || body);

return [{ json: client }];
```

---

## 3. Build Profile Prompt

- **Type:** Code (JavaScript)
- **Input:** Get Client Record

```javascript
const client = $input.first().json;

const prompt = `You are a wealth management client-profiling agent. Given a client's age, goals, time horizon and liquidity needs, output a risk score from 1-10 and a one-paragraph rationale for their target allocation.

Client: ${JSON.stringify({
  age: client.age,
  goals: client.goals,
  timeHorizonYears: client.timeHorizonYears,
  liquidityNeeds: client.liquidityNeeds
})}`;

const geminiRequest = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        riskScore: { type: "INTEGER" },
        allocationRationale: { type: "STRING" }
      },
      required: ["riskScore", "allocationRationale"]
    }
  }
};

return [{ json: { client: client, geminiRequest: geminiRequest } }];
```

---

## 4. Client Profile Agent

- **Type:** HTTP Request
- **Input:** Build Profile Prompt
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY`
- **Headers:** `Content-Type: application/json`
- **Body (JSON mode):** `{{ $json.geminiRequest }}`

---

## 5. Build Price Requests

- **Type:** Code (JavaScript)
- **Input:** Get Client Record

```javascript
const client = $input.first().json;
const equityHoldings = (client.holdings || []).filter(h => h.assetClass === 'equity');
const tickers = [...new Set(equityHoldings.map(h => h.ticker))];

const priceRequests = tickers.map(ticker => ({
  ticker: ticker,
  url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=YOUR_ALPHA_VANTAGE_KEY`,
  client: client
}));

return priceRequests.map(r => ({ json: r }));
```

---

## 6. Fetch Prices Loop

- **Type:** Loop Items (`core_loop`)
- **Input:** Build Price Requests
- **LOOP output** ➔ Alpha Vantage Quote ➔ Rate Limit Delay ➔ back to Loop
- **DONE output** ➔ Portfolio Aggregation

### 6a. Alpha Vantage Quote
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `{{ $json.url }}`

### 6b. Rate Limit Delay
- **Type:** Wait
- **Resume:** After Time Interval (2 seconds) to respect API rate limits.

---

## 7. Portfolio Aggregation

- **Type:** Code (JavaScript)
- **Inputs:** Get Client Record **AND** Fetch Prices Loop (DONE branch)

```javascript
const allItems = $input.all();

let client = null;
const priceMap = {};

for (const item of allItems) {
  const data = item.json;
  if (data && data.holdings) {
    client = data;
  } else if (data && data.body && data.body["Global Quote"]) {
    const quote = data.body["Global Quote"];
    if (quote["05. price"]) {
      priceMap[quote["01. symbol"]] = parseFloat(quote["05. price"]);
    }
  }
}

if (!client) {
  return [{ json: { error: "Client data not found in input items", receivedItemCount: allItems.length } }];
}

const BOND_FUND_NAV = 100;
let totalValue = 0;
const valueByAssetClass = { equity: 0, bonds: 0, cash: 0, alternatives: 0 };

for (const holding of client.holdings) {
  const price = holding.ticker === "BONDFUND" ? BOND_FUND_NAV : (priceMap[holding.ticker] || 0);
  const value = price * holding.quantity;
  totalValue += value;
  valueByAssetClass[holding.assetClass] = (valueByAssetClass[holding.assetClass] || 0) + value;
}

const currentAllocation = {};
for (const assetClass in valueByAssetClass) {
  currentAllocation[assetClass] = totalValue > 0
    ? Math.round((valueByAssetClass[assetClass] / totalValue) * 1000) / 10
    : 0;
}

return [{ json: { client, totalValue: Math.round(totalValue * 100) / 100, currentAllocation } }];
```

---

## 8. Drift Detection

- **Type:** Code (JavaScript)
- **Input:** Portfolio Aggregation
- **Rule:** Breach triggered if `|current - target| > 5%`.

```javascript
const input = $input.first().json;
const client = input.client;
const currentAllocation = input.currentAllocation;
const targetAllocation = client.targetAllocation;

const drift = {};
let maxDrift = 0;

for (const assetClass in targetAllocation) {
  const current = currentAllocation[assetClass] || 0;
  const target = targetAllocation[assetClass] || 0;
  const diff = Math.round((current - target) * 10) / 10;
  drift[assetClass] = diff;
  if (Math.abs(diff) > maxDrift) maxDrift = Math.abs(diff);
}

const breached = maxDrift > 5;

return [{
  json: {
    client: client,
    totalValue: input.totalValue,
    currentAllocation: currentAllocation,
    targetAllocation: targetAllocation,
    drift: drift,
    breached: breached
  }
}];
```

---

## 9. Build Life Event Prompt

- **Type:** Code (JavaScript)
- **Input:** Get Client Record

```javascript
const client = $input.first().json;
const today = new Date().toISOString().split('T')[0];

const prompt = `You detect financially significant life events from a client's event log (marriage, inheritance, retirement, job loss). If an event is recent (within 12 months of today), suggest a directional shift in target allocation and explain why in one sentence. If no event is recent, return activeEvent as null and suggestedShift as all zeros.

Today's date: ${today}
Client life events: ${JSON.stringify(client.lifeEvents)}`;

const geminiRequest = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        activeEvent: { type: "STRING", nullable: true },
        suggestedShift: {
          type: "OBJECT",
          properties: {
            equity: { type: "NUMBER" },
            bonds: { type: "NUMBER" },
            cash: { type: "NUMBER" },
            alternatives: { type: "NUMBER" }
          }
        },
        reasoning: { type: "STRING" }
      },
      required: ["activeEvent", "suggestedShift", "reasoning"]
    }
  }
};

return [{ json: { client: client, geminiRequest: geminiRequest } }];
```

---

## 10. Life Event Agent

- **Type:** HTTP Request
- **Input:** Build Life Event Prompt
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY`
- **Headers:** `Content-Type: application/json`
- **Body:** `{{ $json.geminiRequest }}`

---

## 11. Build Rebalancing Prompt

- **Type:** Code (JavaScript)
- **Inputs:** Drift Detection, Life Event Agent, Client Profile Agent

```javascript
const allItems = $input.all();

let driftReport = null;
let clientProfile = null;
let lifeEvent = null;

for (const item of allItems) {
  const data = item.json;
  if (data.drift) {
    driftReport = data;
  } else if (data.body && data.body.candidates) {
    const text = data.body.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);
    if ('riskScore' in parsed) {
      clientProfile = parsed;
    } else if ('activeEvent' in parsed) {
      lifeEvent = parsed;
    }
  }
}

if (!driftReport || !clientProfile || !lifeEvent) {
  return [{ json: { error: "Missing one or more required inputs", have: { driftReport: !!driftReport, clientProfile: !!clientProfile, lifeEvent: !!lifeEvent } } }];
}

const prompt = `You are a rebalancing agent. Given portfolio drift, an active life event (if any), and the client's risk profile, propose specific buy/sell actions to bring the portfolio back toward target allocation. Explain your reasoning in plain language, referencing the specific drift numbers and event.

Drift report: ${JSON.stringify(driftReport.drift)}
Breached threshold: ${driftReport.breached}
Total portfolio value: ${driftReport.totalValue}
Current allocation: ${JSON.stringify(driftReport.currentAllocation)}
Target allocation: ${JSON.stringify(driftReport.targetAllocation)}
Life event: ${JSON.stringify(lifeEvent)}
Client risk profile: riskScore ${clientProfile.riskScore}, rationale: ${clientProfile.allocationRationale}`;

const geminiRequest = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        trades: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              action: { type: "STRING" },
              assetClass: { type: "STRING" },
              amount: { type: "STRING" }
            }
          }
        },
        reasoning: { type: "STRING" }
      },
      required: ["trades", "reasoning"]
    }
  }
};

return [{ json: { client: driftReport.client, clientProfile, driftReport, lifeEvent, geminiRequest } }];
```

---

## 12. Rebalancing Agent

- **Type:** HTTP Request
- **Input:** Build Rebalancing Prompt
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY`
- **Headers:** `Content-Type: application/json`
- **Body:** `{{ $json.geminiRequest }}`

---

## 13. Build Compliance Prompt

- **Type:** Code (JavaScript)
- **Inputs:** Rebalancing Agent, Client Profile Agent

```javascript
const allItems = $input.all();

let trades = null;
let clientProfile = null;

for (const item of allItems) {
  const data = item.json;
  if (data.body && data.body.candidates) {
    const text = data.body.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);
    if ('trades' in parsed) {
      trades = parsed;
    } else if ('riskScore' in parsed) {
      clientProfile = parsed;
    }
  }
}

if (!trades || !clientProfile) {
  return [{ json: { error: "Missing required inputs for compliance check", have: { trades: !!trades, clientProfile: !!clientProfile } } }];
}

const prompt = `You are a suitability compliance reviewer. Check whether the proposed trades are consistent with the client's stated risk tolerance and goals. If any trade increases risk beyond what's suitable, flag it. Write your justification the way a compliance officer would write a file note.

Proposed trades: ${JSON.stringify(trades.trades)}
Rebalancing reasoning: ${trades.reasoning}
Client risk score (1-10): ${clientProfile.riskScore}
Client allocation rationale: ${clientProfile.allocationRationale}`;

const geminiRequest = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        approved: { type: "BOOLEAN" },
        justification: { type: "STRING" },
        flaggedTrades: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["approved", "justification", "flaggedTrades"]
    }
  }
};

return [{ json: { trades, clientProfile, geminiRequest } }];
```

---

## 14. Compliance Agent

- **Type:** HTTP Request
- **Input:** Build Compliance Prompt
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=YOUR_API_KEY`
- **Headers:** `Content-Type: application/json`
- **Body:** `{{ $json.geminiRequest }}`

---

## 15. Assemble Final Trace

- **Type:** Code (JavaScript)
- **Inputs:** Build Rebalancing Prompt, Rebalancing Agent, Compliance Agent
- **Last node in the workflow**: returned to the caller by Webhook Trigger.

```javascript
const allItems = $input.all();

let base = null;
let rebalancing = null;
let compliance = null;

for (const item of allItems) {
  const data = item.json;
  if (data.driftReport && data.lifeEvent && data.clientProfile) {
    base = data;
  } else if (data.body && data.body.candidates) {
    const text = data.body.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);
    if ('trades' in parsed) {
      rebalancing = parsed;
    } else if ('approved' in parsed) {
      compliance = parsed;
    }
  }
}

if (!base || !rebalancing || !compliance) {
  return [{ json: { error: "Missing pieces for final trace", have: { base: !!base, rebalancing: !!rebalancing, compliance: !!compliance } } }];
}

const trace = {
  client: {
    clientId: base.client.clientId,
    name: base.client.name,
    riskTolerance: base.client.riskTolerance
  },
  agents: {
    clientProfile: base.clientProfile,
    portfolioAggregation: {
      totalValue: base.driftReport.totalValue,
      currentAllocation: base.driftReport.currentAllocation
    },
    lifeEvent: base.lifeEvent,
    driftDetection: {
      drift: base.driftReport.drift,
      breached: base.driftReport.breached,
      targetAllocation: base.driftReport.targetAllocation
    },
    rebalancingRecommendation: rebalancing,
    compliance: compliance
  }
};

return [{ json: trace }];
```
