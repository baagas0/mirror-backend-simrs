const Controller = require('./controller');
const router = require('express').Router();
const authentification = require('../../middleware/authentification');

router.post('/list', authentification, Controller.list);
router.post('/detail', authentification, Controller.detail);
router.post('/exportPdf', authentification, Controller.exportPdf);
router.post('/waktu-tunggu', authentification, Controller.waktuTunggu);
router.post('/waktu-tunggu/exportPdf', authentification, Controller.exportWaktuTungguPdf);
router.post('/pembatalan', authentification, Controller.pembatalan);
router.post('/pembatalan/exportPdf', authentification, Controller.exportPembatalanPdf);
router.post('/pembatalan/proses', authentification, Controller.batalkanPemeriksaan);

module.exports = router;