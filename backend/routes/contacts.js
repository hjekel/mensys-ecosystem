import express from 'express';
import { listContacts } from '../services/contactsService.js';

const router = express.Router();

// Stub endpoint. Phase 1 uses localStorage on the frontend.
// Later this will proxy Airtable.
router.get('/', async (_req, res) => {
  const contacts = await listContacts();
  res.json({ contacts });
});

export default router;
