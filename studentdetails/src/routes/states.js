import { Router } from 'express';
import { getStates, getDistrictsByState } from '../services/stateService.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const states = await getStates();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load states' });
  }
});

router.get('/:state/districts', async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await getDistrictsByState(state);
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load districts' });
  }
});

export default router;



