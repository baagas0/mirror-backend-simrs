const express = require('express');
const router = express.Router();
const controller = require('./controller');

// POST - Create pengambilan sampel
router.post('/register', controller.createPengambilanSampel);

// PUT - Start pengambilan sampel
router.post('/:id/start', controller.startPengambilanSampel);

// PUT - Finish pengambilan sampel
router.post('/:id/finish', controller.finishPengambilanSampel);

// PUT - Cancel pengambilan sampel
router.post('/:id/cancel', controller.cancelPengambilanSampel);

// GET - Get pengambilan sampel by id
router.post('/detailsById', controller.getPengambilanSampelById);

// GET - Get pengambilan sampel by lab_regis_id
router.post('/lab-regis/:lab_regis_id', controller.getPengambilanSampelByLabRegisId);

// GET - Get all pengambilan sampel
router.post('/list', controller.getAllPengambilanSampel);

// POST - Sync to Satu Sehat
router.post('/:id/sync-satu-sehat', controller.syncToSatuSehat);

module.exports = router;