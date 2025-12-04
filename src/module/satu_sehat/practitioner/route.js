const Controller = require('./controller');
const router = require('express').Router();


router.post('/get_practitioner_by_id', Controller.get_practitioner_by_id);
router.post('/get_practitioner', Controller.get_practitioner);

module.exports = router