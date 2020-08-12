const { Router } = require('express');
const backend = require('../controllers/backend');

const router = Router();
router.post('/covid_data', backend.covidData);

module.exports = router;