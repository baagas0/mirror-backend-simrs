const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');


router.post('/register', authentification, Controller.register);
router.post('/update', authentification, Controller.update);
router.post('/delete', authentification, Controller.delete);
router.post('/list', authentification, Controller.list);
router.post('/listPerHalaman', authentification, Controller.listPerHalaman);
router.post('/detailsById', authentification, Controller.detailsById);
router.post('/detailsByNIK', authentification, Controller.detailsByNIK);
router.post('/detailsByNorm', Controller.detailsByNorm);
router.post('/getRmTerakhir', Controller.getRmTerakhir);


module.exports = router