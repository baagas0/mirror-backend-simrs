const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../../middleware/authentification');


router.post('/get_location_by_id', authentification, Controller.get_location_by_id);
router.post('/get_location', authentification, Controller.get_location);
router.post('/add_location', authentification, Controller.add_location);


module.exports = router