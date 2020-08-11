import { Router } from 'express';
import backend from '../controllers/backend';

const router = Router();
router.post('/covid_data', backend.covidData);

export default router;