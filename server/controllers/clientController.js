import { ClientProfile } from '../models/ClientProfile.js';
import { User } from '../models/User.js';
import { dbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const FALLBACK_PRICES = {
  SBIN: 820.0,
  HDFCBANK: 1650.0,
  HDB: 65.5,
  BONDFUND: 100.0,
  AAPL: 230.0,
  MSFT: 420.0,
};

function calculateHoldingsTotal(holdings) {
  if (!Array.isArray(holdings) || holdings.length === 0) return 0;
  const total = holdings.reduce((sum, h) => {
    const qty = Number(h.quantity) || 0;
    const ticker = (h.ticker || '').toUpperCase();
    const prc = Number(h.price) > 0 ? Number(h.price) : (FALLBACK_PRICES[ticker] || 100);
    return sum + qty * prc;
  }, 0);
  return Math.round(total * 100) / 100;
}

// @desc    Get current client's own profile
// @route   GET /api/clients/me
// @access  Private (Client or Manager)
export async function getMyClientProfile(req, res) {
  try {
    const userClientId = req.user.clientId;
    const userEmail = (req.user.email || '').toLowerCase().trim();

    if (dbStatus.connected) {
      let client = await ClientProfile.findOne({
        $or: [{ clientId: userClientId }, { email: userEmail }],
      });

      if (!client) {
        // Auto-create a clean empty client profile if one does not exist yet
        client = await ClientProfile.create({
          clientId: userClientId || `C${Date.now().toString().slice(-4)}`,
          name: req.user.name,
          email: userEmail,
          age: 30,
          riskTolerance: 'moderate',
          riskScore: 7,
          timeHorizonYears: 10,
          liquidityNeeds: 'medium',
          goals: ['retirement'],
          targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
          lifeEvents: [],
          holdings: [],
          totalValue: 0,
          activePlan: 'Balanced Growth Strategy',
          nextMilestone: 'Initial Review',
          status: 'Active',
          lastActivity: 'Just now',
          accentColor: '#C9A227',
        });
      }

      return res.json({ success: true, data: client });
    } else {
      let client = memoryStore.clientProfiles.find(
        (c) => (userClientId && c.clientId === userClientId) || c.email.toLowerCase() === userEmail
      );

      if (!client) {
        const newClientId = userClientId || `C${String(memoryStore.clientProfiles.length + 1).padStart(3, '0')}`;
        client = {
          clientId: newClientId,
          name: req.user.name,
          email: userEmail,
          age: 30,
          riskTolerance: 'moderate',
          riskScore: 7,
          timeHorizonYears: 10,
          liquidityNeeds: 'medium',
          goals: ['retirement'],
          targetAllocation: { equity: 60, bonds: 20, cash: 10, alternatives: 10 },
          lifeEvents: [],
          holdings: [],
          totalValue: 0,
          performancePct: 0,
          performance: [0],
          activePlan: 'Growth Focus',
          nextMilestone: 'Initial Review',
          status: 'Active',
          lastActivity: 'Just now',
          accentColor: '#C9A227',
          latestTrace: null,
        };
        memoryStore.clientProfiles.push(client);
      }

      return res.json({ success: true, data: client });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your profile', error: err.message });
  }
}

// @desc    Get all clients (Manager only)
// @route   GET /api/clients
// @access  Private (Manager)
export async function getAllClients(req, res) {
  try {
    if (dbStatus.connected) {
      const clients = await ClientProfile.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: clients.length, data: clients });
    } else {
      return res.json({
        success: true,
        count: memoryStore.clientProfiles.length,
        data: memoryStore.clientProfiles,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch clients', error: err.message });
  }
}

// @desc    Get single client by clientId
// @route   GET /api/clients/:clientId
// @access  Private
export async function getClientById(req, res) {
  try {
    const { clientId } = req.params;

    // Security: Clients can only access their own profile unless role is manager
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only access your own profile.' });
    }

    if (dbStatus.connected) {
      const client = await ClientProfile.findOne({ clientId });
      if (!client) {
        return res.status(404).json({ success: false, message: `Client with ID ${clientId} not found.` });
      }
      return res.json({ success: true, data: client });
    } else {
      const client = memoryStore.clientProfiles.find((c) => c.clientId === clientId);
      if (!client) {
        return res.status(404).json({ success: false, message: `Client with ID ${clientId} not found.` });
      }
      return res.json({ success: true, data: client });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch client profile', error: err.message });
  }
}

// @desc    Update client profile, target allocation, holdings, or life events
// @route   PUT /api/clients/:clientId
// @access  Private
export async function updateClientProfile(req, res) {
  try {
    const { clientId } = req.params;

    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot modify other client profiles.' });
    }

    const updates = { ...req.body };

    // Format and recalculate holdings if updated
    if (updates.holdings && Array.isArray(updates.holdings)) {
      updates.holdings = updates.holdings.map((h) => {
        const ticker = (h.ticker || '').toUpperCase().trim();
        const price = Number(h.price) > 0 ? Number(h.price) : (FALLBACK_PRICES[ticker] || 100);
        return {
          ...h,
          ticker,
          price,
          quantity: Number(h.quantity) || 0,
        };
      });
      updates.totalValue = calculateHoldingsTotal(updates.holdings);
      updates.performance = [updates.totalValue];
    }

    // Synchronize User.name if name is updated
    if (updates.name && updates.name.trim()) {
      const cleanName = updates.name.trim();
      updates.name = cleanName;

      if (dbStatus.connected) {
        await User.findOneAndUpdate(
          { $or: [{ clientId }, { email: req.user.email }] },
          { name: cleanName }
        );
      } else {
        const uIdx = memoryStore.users.findIndex(
          (u) => u.clientId === clientId || u.email === req.user.email
        );
        if (uIdx !== -1) {
          memoryStore.users[uIdx].name = cleanName;
        }
      }
    }

    if (dbStatus.connected) {
      const updated = await ClientProfile.findOneAndUpdate(
        { clientId },
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: `Client ${clientId} not found.` });
      }
      return res.json({ success: true, message: 'Profile updated successfully in database.', data: updated });
    } else {
      const index = memoryStore.clientProfiles.findIndex((c) => c.clientId === clientId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: `Client ${clientId} not found.` });
      }
      memoryStore.clientProfiles[index] = { ...memoryStore.clientProfiles[index], ...updates };
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: memoryStore.clientProfiles[index],
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update client profile', error: err.message });
  }
}

// @desc    Add a holding to client profile
// @route   POST /api/clients/:clientId/holdings
// @access  Private
export async function addClientHolding(req, res) {
  try {
    const { clientId } = req.params;
    const { ticker, custodian = 'Zerodha', quantity = 0, price = 0, assetClass = 'equity' } = req.body;

    if (!ticker) {
      return res.status(400).json({ success: false, message: 'Ticker symbol is required.' });
    }

    const cleanTicker = ticker.toUpperCase().trim();
    const cleanQty = Number(quantity) || 0;
    const cleanPrice = Number(price) > 0 ? Number(price) : (FALLBACK_PRICES[cleanTicker] || 100);

    const newHolding = {
      ticker: cleanTicker,
      custodian,
      quantity: cleanQty,
      price: cleanPrice,
      assetClass,
    };

    if (dbStatus.connected) {
      const client = await ClientProfile.findOne({ clientId });
      if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });

      client.holdings.push(newHolding);
      client.totalValue = calculateHoldingsTotal(client.holdings);
      client.performance = [client.totalValue];
      client.lastActivity = `Added ${cleanTicker}`;
      await client.save();

      return res.json({ success: true, message: `Holding ${cleanTicker} added successfully.`, data: client });
    } else {
      const index = memoryStore.clientProfiles.findIndex((c) => c.clientId === clientId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Client not found.' });

      memoryStore.clientProfiles[index].holdings.push(newHolding);
      memoryStore.clientProfiles[index].totalValue = calculateHoldingsTotal(
        memoryStore.clientProfiles[index].holdings
      );
      memoryStore.clientProfiles[index].performance = [memoryStore.clientProfiles[index].totalValue];
      memoryStore.clientProfiles[index].lastActivity = `Added ${cleanTicker}`;

      return res.json({
        success: true,
        message: `Holding ${cleanTicker} added successfully.`,
        data: memoryStore.clientProfiles[index],
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add holding', error: err.message });
  }
}

// @desc    Delete a holding from client profile
// @route   DELETE /api/clients/:clientId/holdings/:ticker
// @access  Private
export async function deleteClientHolding(req, res) {
  try {
    const { clientId, ticker } = req.params;
    const cleanTicker = ticker.toUpperCase().trim();

    if (dbStatus.connected) {
      const client = await ClientProfile.findOne({ clientId });
      if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });

      client.holdings = client.holdings.filter((h) => h.ticker.toUpperCase() !== cleanTicker);
      client.totalValue = calculateHoldingsTotal(client.holdings);
      client.performance = [client.totalValue];
      client.lastActivity = `Removed ${cleanTicker}`;
      await client.save();

      return res.json({ success: true, message: `Holding ${cleanTicker} removed.`, data: client });
    } else {
      const index = memoryStore.clientProfiles.findIndex((c) => c.clientId === clientId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Client not found.' });

      memoryStore.clientProfiles[index].holdings = memoryStore.clientProfiles[index].holdings.filter(
        (h) => h.ticker.toUpperCase() !== cleanTicker
      );
      memoryStore.clientProfiles[index].totalValue = calculateHoldingsTotal(
        memoryStore.clientProfiles[index].holdings
      );
      memoryStore.clientProfiles[index].performance = [memoryStore.clientProfiles[index].totalValue];
      memoryStore.clientProfiles[index].lastActivity = `Removed ${cleanTicker}`;

      return res.json({
        success: true,
        message: `Holding ${cleanTicker} removed.`,
        data: memoryStore.clientProfiles[index],
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove holding', error: err.message });
  }
}

// @desc    Save latest AI Agent Trace
// @route   POST /api/clients/:clientId/trace
// @access  Private
export async function saveClientTrace(req, res) {
  try {
    const { clientId } = req.params;
    const { trace } = req.body;

    if (!trace) {
      return res.status(400).json({ success: false, message: 'Trace object is required.' });
    }

    if (dbStatus.connected) {
      const updated = await ClientProfile.findOneAndUpdate(
        { clientId },
        { $set: { latestTrace: trace, lastActivity: 'AI Analysis Completed' } },
        { new: true }
      );
      return res.json({ success: true, message: 'Trace saved successfully.', data: updated });
    } else {
      const index = memoryStore.clientProfiles.findIndex((c) => c.clientId === clientId);
      if (index !== -1) {
        memoryStore.clientProfiles[index].latestTrace = trace;
        memoryStore.clientProfiles[index].lastActivity = 'AI Analysis Completed';
      }
      return res.json({ success: true, message: 'Trace saved successfully.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save trace', error: err.message });
  }
}
