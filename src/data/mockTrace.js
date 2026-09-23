export const mockClientsExtended = [
  { id: "C001", name: "Ananya Rao", email: "ananya@meridian.com", password: "client123", riskTolerance: "Moderate", riskScore: 8, accentColor: "#C9A227", totalValue: 51782.5, performancePct: 1.1, performance: [51200, 51400, 51100, 51600, 51900, 51700, 51782.5], activePlan: "Growth Strategy", nextMilestone: "Retirement Focus", isLive: true, status: "Active", lastActivity: "2 hours ago", goals: [{ label: "Retirement Fund", progress: 42 }, { label: "Child's Education", progress: 27 }] },
  { id: "C002", name: "Mark Chen", email: "mark@meridian.com", password: "client123", riskTolerance: "High", riskScore: 9, accentColor: "#C1614A", totalValue: 84210, performancePct: 5.3, performance: [80000, 81200, 82500, 81900, 83400, 84000, 84210], activePlan: "Aggressive Growth", nextMilestone: "Portfolio Review", isLive: false, status: "Active", lastActivity: "5 hours ago", goals: [{ label: "Early Retirement", progress: 61 }, { label: "Investment Property", progress: 34 }] },
  { id: "C003", name: "Priya Nair", email: "priya@meridian.com", password: "client123", riskTolerance: "Low", riskScore: 3, accentColor: "#4FA88F", totalValue: 32950, performancePct: -1.6, performance: [33500, 33200, 32800, 33000, 32700, 32900, 32950], activePlan: "Capital Preservation", nextMilestone: "Annual Review", isLive: false, status: "Active", lastActivity: "1 day ago", goals: [{ label: "Emergency Reserve", progress: 88 }, { label: "Home Down Payment", progress: 52 }] },
  { id: "C004", name: "Arun Iyer", email: "arun@meridian.com", password: "client123", riskTolerance: "Moderate", riskScore: 6, accentColor: "#6C87A8", totalValue: 67300, performancePct: 3.5, performance: [65000, 65800, 66500, 66200, 67000, 67150, 67300], activePlan: "Balanced Growth", nextMilestone: "Tax Planning", isLive: false, status: "Active", lastActivity: "1 day ago", goals: [{ label: "Tax-Advantaged Savings", progress: 45 }, { label: "College Fund", progress: 19 }] },
];

export const mockTracesById = {
  C001: {
    client: { clientId: "C001", name: "Ananya Rao", riskTolerance: "moderate" },
    agents: {
      clientProfile: {
        riskScore: 8,
        allocationRationale: "Given a long-term horizon of 20 years and low immediate liquidity needs, this client is well-positioned for an aggressive growth strategy, with capacity to weather short-term volatility in pursuit of retirement and education funding goals.",
      },
      portfolioAggregation: {
        totalValue: 51782.5,
        currentAllocation: { equity: 61.4, bonds: 38.6, cash: 0, alternatives: 0 },
      },
      lifeEvent: {
        activeEvent: "marriage",
        suggestedShift: { equity: -10, bonds: 0, cash: 5, alternatives: 0 },
        reasoning: "Combining household finances after marriage calls for increased short-term liquidity and a slightly more conservative balance to protect shared goals.",
      },
      driftDetection: {
        drift: { equity: 1.4, bonds: 8.6, cash: -5, alternatives: -5 },
        breached: true,
        targetAllocation: { equity: 60, bonds: 30, cash: 5, alternatives: 5 },
      },
      rebalancingRecommendation: {
        trades: [
          { action: "sell", assetClass: "equity", amount: "724.96" },
          { action: "sell", assetClass: "bonds", amount: "4453.30" },
          { action: "buy", assetClass: "cash", amount: "2589.13" },
          { action: "buy", assetClass: "alternatives", amount: "2589.13" },
        ],
        reasoning: "The portfolio has breached its rebalancing threshold, with equity over-allocated by +1.4% and bonds over-allocated by +8.6%, while cash and alternatives are both under-allocated by -5.0% each.",
      },
      compliance: {
        approved: true,
        justification: "The proposed trades have been reviewed for suitability and are approved. The transactions rebalance the portfolio back to its agreed target asset allocation following variance threshold breaches.",
        flaggedTrades: [],
      },
    },
  },
  C002: {
    client: { clientId: "C002", name: "Mark Chen", riskTolerance: "high" },
    agents: {
      clientProfile: {
        riskScore: 9,
        allocationRationale: "With a high risk tolerance and no near-term liquidity needs, this client is well-positioned for an aggressive, equity-concentrated growth strategy across market cycles.",
      },
      portfolioAggregation: {
        totalValue: 84210,
        currentAllocation: { equity: 83.7, bonds: 16.3, cash: 0, alternatives: 0 },
      },
      lifeEvent: {
        activeEvent: "job promotion",
        suggestedShift: { equity: 3, bonds: -1, cash: -1, alternatives: -1 },
        reasoning: "A recent promotion increases income stability and risk capacity, supporting a modest tilt toward further growth-oriented assets.",
      },
      driftDetection: {
        drift: { equity: 8.7, bonds: -3.7, cash: -5, alternatives: 0 },
        breached: true,
        targetAllocation: { equity: 75, bonds: 20, cash: 5, alternatives: 0 },
      },
      rebalancingRecommendation: {
        trades: [
          { action: "sell", assetClass: "equity", amount: "7326.27" },
          { action: "buy", assetClass: "bonds", amount: "3115.77" },
          { action: "buy", assetClass: "cash", amount: "4210.50" },
        ],
        reasoning: "The portfolio has breached its rebalancing threshold, with equity over-allocated by +8.7% even against an aggressive growth target. Following a recent promotion, we recommend trimming equity exposure to establish a cash reserve while preserving a growth-oriented core allocation.",
      },
      compliance: {
        approved: true,
        justification: "The proposed trades are suitable given the client's high risk tolerance (9/10) and stated growth objectives. Trimming equity exposure to fund a cash reserve does not materially alter the aggressive growth strategy and improves liquidity resilience.",
        flaggedTrades: [],
      },
    },
  },
  C003: {
    client: { clientId: "C003", name: "Priya Nair", riskTolerance: "low" },
    agents: {
      clientProfile: {
        riskScore: 3,
        allocationRationale: "With a low risk tolerance and near-term liquidity needs, this client's portfolio prioritizes capital preservation, favoring high-quality fixed income and modest equity exposure.",
      },
      portfolioAggregation: {
        totalValue: 32950,
        currentAllocation: { equity: 28.0, bonds: 72.0, cash: 0, alternatives: 0 },
      },
      lifeEvent: {
        activeEvent: null,
        suggestedShift: { equity: 0, bonds: 0, cash: 0, alternatives: 0 },
        reasoning: "No recent life event detected requiring a change in strategy.",
      },
      driftDetection: {
        drift: { equity: -2.0, bonds: 4.0, cash: -2, alternatives: 0 },
        breached: false,
        targetAllocation: { equity: 30, bonds: 68, cash: 2, alternatives: 0 },
      },
      rebalancingRecommendation: {
        trades: [],
        reasoning: "Current allocation remains within the client's conservative target range; no rebalancing action is required at this time.",
      },
      compliance: {
        approved: true,
        justification: "No trades proposed. The portfolio's allocation is consistent with the client's low risk tolerance and capital preservation objective.",
        flaggedTrades: [],
      },
    },
  },
  C004: {
    client: { clientId: "C004", name: "Arun Iyer", riskTolerance: "moderate" },
    agents: {
      clientProfile: {
        riskScore: 6,
        allocationRationale: "With a moderate risk tolerance and a balanced time horizon, this client's portfolio blends growth and stability through a diversified mix of equities and fixed income.",
      },
      portfolioAggregation: {
        totalValue: 67300,
        currentAllocation: { equity: 74.6, bonds: 25.4, cash: 0, alternatives: 0 },
      },
      lifeEvent: {
        activeEvent: null,
        suggestedShift: { equity: 0, bonds: 0, cash: 0, alternatives: 0 },
        reasoning: "No recent life event detected requiring a change in strategy.",
      },
      driftDetection: {
        drift: { equity: 4.6, bonds: 0.4, cash: -5, alternatives: 0 },
        breached: false,
        targetAllocation: { equity: 70, bonds: 25, cash: 5, alternatives: 0 },
      },
      rebalancingRecommendation: {
        trades: [],
        reasoning: "Portfolio remains closely aligned with target allocation. Given the client's upcoming tax planning review, consider evaluating tax-loss harvesting opportunities rather than a full rebalance.",
      },
      compliance: {
        approved: true,
        justification: "No trades proposed. Current allocation is suitable for the client's moderate risk profile.",
        flaggedTrades: [],
      },
    },
  },
};

export const mockHoldingsById = {
  C001: [
    { ticker: "AAPL", custodian: "Zerodha", assetClass: "equity", quantity: 50, price: 337.0 },
    { ticker: "MSFT", custodian: "Groww", assetClass: "equity", quantity: 30, price: 497.75 },
    { ticker: "BONDFUND", custodian: "Zerodha", assetClass: "bonds", quantity: 200, price: 100.0 },
  ],
  C002: [
    { ticker: "AAPL", custodian: "Zerodha", assetClass: "equity", quantity: 150, price: 337.0 },
    { ticker: "MSFT", custodian: "Groww", assetClass: "equity", quantity: 40, price: 497.75 },
    { ticker: "BONDFUND", custodian: "Zerodha", assetClass: "bonds", quantity: 137.5, price: 100.0 },
  ],
  C003: [
    { ticker: "AAPL", custodian: "Zerodha", assetClass: "equity", quantity: 20, price: 337.0 },
    { ticker: "MSFT", custodian: "Groww", assetClass: "equity", quantity: 5, price: 497.75 },
    { ticker: "BONDFUND", custodian: "Zerodha", assetClass: "bonds", quantity: 237.2125, price: 100.0 },
  ],
  C004: [
    { ticker: "AAPL", custodian: "Zerodha", assetClass: "equity", quantity: 90, price: 337.0 },
    { ticker: "MSFT", custodian: "Groww", assetClass: "equity", quantity: 40, price: 497.75 },
    { ticker: "BONDFUND", custodian: "Zerodha", assetClass: "bonds", quantity: 170.6, price: 100.0 },
  ],
};