import { ClientProfile } from '../models/ClientProfile.js';
import { dbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

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

    const updates = req.body;

    if (dbStatus.connected) {
      const updated = await ClientProfile.findOneAndUpdate({ clientId }, { $set: updates }, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: `Client ${clientId} not found.` });
      }
      return res.json({ success: true, message: 'Profile updated successfully.', data: updated });
    } else {
      const index = memoryStore.clientProfiles.findIndex((c) => c.clientId === clientId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: `Client ${clientId} not found.` });
      }
      memoryStore.clientProfiles[index] = { ...memoryStore.clientProfiles[index], ...updates };
      return res.json({
        success: true,
        message: 'Profile updated successfully (In-Memory).',
        data: memoryStore.clientProfiles[index],
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update client profile', error: err.message });
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
      return res.json({ success: true, message: 'Trace saved successfully (In-Memory).' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save trace', error: err.message });
  }
}
