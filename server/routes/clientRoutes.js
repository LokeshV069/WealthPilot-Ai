import express from 'express';
import {
  getAllClients,
  getClientById,
  updateClientProfile,
  saveClientTrace,
} from '../controllers/clientController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Manager only: fetch all clients
router.get('/', protect, requireRole('manager'), getAllClients);

// Authenticated users: fetch, update profile, save trace
router.get('/:clientId', protect, getClientById);
router.put('/:clientId', protect, updateClientProfile);
router.post('/:clientId/trace', protect, saveClientTrace);

export default router;
