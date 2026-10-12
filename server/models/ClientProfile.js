import mongoose from 'mongoose';

const clientProfileSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 30,
    },
    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive', 'low', 'high', 'Low', 'Moderate', 'High'],
      default: 'moderate',
    },
    riskScore: {
      type: Number,
      default: 7,
      min: 1,
      max: 10,
    },
    timeHorizonYears: {
      type: Number,
      default: 10,
    },
    liquidityNeeds: {
      type: String,
      enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High'],
      default: 'medium',
    },
    goals: {
      type: [String],
      default: ['retirement'],
    },
    targetAllocation: {
      equity: { type: Number, default: 60 },
      bonds: { type: Number, default: 20 },
      cash: { type: Number, default: 10 },
      alternatives: { type: Number, default: 10 },
    },
    lifeEvents: [
      {
        type: { type: String, default: 'marriage' },
        date: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    holdings: [
      {
        ticker: { type: String, required: true },
        custodian: { type: String, default: 'Zerodha' },
        quantity: { type: Number, default: 0 },
        assetClass: { type: String, default: 'equity' },
        price: { type: Number, default: 0 },
      },
    ],
    totalValue: {
      type: Number,
      default: 0,
    },
    performancePct: {
      type: Number,
      default: 2.5,
    },
    performance: {
      type: [Number],
      default: [50000, 50800, 51200, 50900, 51780],
    },
    activePlan: {
      type: String,
      default: 'Balanced Growth Strategy',
    },
    nextMilestone: {
      type: String,
      default: 'Portfolio Review',
    },
    status: {
      type: String,
      default: 'Active',
    },
    lastActivity: {
      type: String,
      default: 'Just now',
    },
    accentColor: {
      type: String,
      default: '#C9A227',
    },
    latestTrace: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ClientProfile = mongoose.model('ClientProfile', clientProfileSchema);
