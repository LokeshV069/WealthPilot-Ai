import express from 'express';
import {
  getMyClientProfile,
  getAllClients,
  getClientById,
  updateClientProfile,
  addClientHolding,
  deleteClientHolding,
  saveClientTrace,
} from '../controllers/clientController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Current authenticated client's profile
router.get('/me', protect, getMyClientProfile);

// Manager only: fetch all clients
router.get('/', protect, requireRole('manager'), getAllClients);

// Authenticated users: fetch, update profile, manage holdings, save trace
router.get('/:clientId', protect, getClientById);
router.put('/:clientId', protect, updateClientProfile);
router.post('/:clientId/holdings', protect, addClientHolding);
router.delete('/:clientId/holdings/:ticker', protect, deleteClientHolding);
router.post('/:clientId/trace', protect, saveClientTrace);

export default router;
