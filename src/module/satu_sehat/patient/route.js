const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../../middleware/authentification');


router.post('/get_patient_by_id', authentification, Controller.get_patient_by_id);
router.post('/get_patient', authentification, Controller.get_patient);


module.exports = router