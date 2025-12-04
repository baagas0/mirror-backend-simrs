const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');


router.post('/createReqMutasi', authentification, Controller.createReqMutasi);
router.post('/updateReqMutasi', authentification, Controller.updateReqMutasi);
router.post('/createMutasi', authentification, Controller.createMutasi);
router.post('/updateMutasi', authentification, Controller.updateMutasi);
router.post('/proses', authentification, Controller.proses);
// router.post('/update', authentification, Controller.update);
router.post('/delete', authentification, Controller.delete);
// router.get('/list', authentification, Controller.list);
router.post('/detailsById', Controller.detailsById);
router.post('/listWithParam', authentification, Controller.listWithParam);
router.post('/allPagination', authentification, Controller.allPagination);


module.exports = router