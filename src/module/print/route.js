const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');


router.post('/printAntrian', authentification, Controller.printAntrian);
router.post('/printSEP', authentification, Controller.printSEP);


module.exports = router